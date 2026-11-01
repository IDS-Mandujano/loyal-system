    import { NextResponse } from "next/server";
    import db from "@/lib/db";
    import { getExternalData } from "@/lib/fakeapi";
    import { queries } from "@/lib/services/syncService"
    import { hasPermission } from "@/lib/services/authService";


    const CUTOFF_DATE = new Date('2026-04-30T23:59:59');

    const EXCHANGE_RATES = {
        USD: 18.50, EUR: 20.00, GBP: 23.50,
        CAD: 13.50, AUD: 12.00, MXN: 1.00
    };

    export async function POST(request){

        const sessionCookie = request.cookies.get("user_session")?.value;
        if (!sessionCookie){
            return NextResponse.json(
                {success : false, error: "No autorizado. Inicia sesión."},
                { status : 401 }
            )
        }

        const session = JSON.parse(sessionCookie);

        const canSync = await hasPermission(session.id, 'execute_sync');
        if (!canSync){
            return NextResponse.json(
                { success : false, error : "Acceso denegado. No tienes el permiso de execute_sync" },
                { status : 403   }
            )
        }

        const apikey = process.env.FAKE_API_KEY;
        if(!apikey){
            return NextResponse.json({success: false, error: 'Falta configurar FAKE_API_KEY'}, {status: 400});
        }

        const client = await db.getClient();

        try {
            const { users, orders, payments } = await getExternalData(apikey);

            console.log('🔄 Iniciando transacción y procesamiento en Supabase...');
            await client.query('BEGIN');

            const validUserIDs = new Set(users.map(u => u.id));

            for (let i = 0; i < users.length; i += 500) {
                const batch = users.slice(i, i + 500);
                await queries.upsertUsersBatch(client, batch);
            }
            console.log('✅ Usuarios sincronizados masivamente.');

            const validOrders = orders.filter(o => validUserIDs.has(o.user.id) && new Date(o.created_at) <= CUTOFF_DATE);
            const validOrderIDs = new Set(validOrders.map(o => o.id));

            for (let i = 0; i < validOrders.length; i += 500) {
                const batch = validOrders.slice(i, i + 500);
                await queries.upsertOrdersBatch(client, batch);
            }
            console.log('✅ Órdenes sincronizadas masivamente.');

            const validPayments = payments
                .filter(p => validUserIDs.has(p.user.id) && new Date(p.paid_at || p.created_at) <= CUTOFF_DATE)
                .map(p => {
                    const orderId = p.metadata?.order_id;
                    if (orderId && !validOrderIDs.has(orderId)) {
                        return { ...p, metadata: { ...p.metadata, order_id: null } };
                    }
                    return p;
                });
            
            for (let i = 0; i < validPayments.length; i += 500) {
                const batch = validPayments.slice(i, i + 500);
                await queries.upsertPaymentsBatch(client, batch);
            }

            const pointMovements = [];
            for (const payment of validPayments) {
                const rate = EXCHANGE_RATES[payment.currency];
                if (!rate) continue;

                const paymentDate = new Date(payment.paid_at || payment.created_at);
                const points = Math.floor((payment.amount * rate) / 10.0);
                const fecha = paymentDate.toISOString().split('T')[0];
                const ref = `pago: ${payment.id}`;

                if (payment.status === 'succeeded') {
                    pointMovements.push([payment.user.id, fecha, 'pago', ref, points]);
                } else if (payment.status === 'refunded') {
                    pointMovements.push([payment.user.id, fecha, 'reembolso', ref, -points]);
                }
            }

            if (pointMovements.length > 0) {
                for (let i = 0; i < pointMovements.length; i += 500) {
                    const batch = pointMovements.slice(i, i + 500);
                    await queries.insertPointMovementsBatch(client, batch);
                }
            }
            console.log('✅ Pagos y movimientos de puntos sincronizados.');

            const deliveredOrders = await queries.getDeliveredOrders(client, CUTOFF_DATE);
            const bonusMovements = [];

            for (const order of deliveredOrders.rows){
                const ref = `orden: ${order.id}`;
                const existing = await queries.checkBonusExists(client, ref);
                if (existing.rowCount === 0){
                    const fecha = new Date(order.created_at).toISOString().split('T')[0];
                    bonusMovements.push([order.user_id, fecha, 'bono_orden_entregada', ref, 250]);
                }
            }

            if (bonusMovements.length > 0) {
                for (let i = 0; i < bonusMovements.length; i += 500) {
                    const batch = bonusMovements.slice(i, i + 500);
                    await queries.insertPointMovementsBatch(client, batch);
                }
            }
            console.log('✅ Bonos de órdenes procesados.');

            await queries.updateAllUserMetrics(client, CUTOFF_DATE);
            console.log('✅ Métricas y tiers actualizados en la base de datos.')

            await client.query('COMMIT');
            console.log('🎉 ¡Sincronización completada con éxito!');
            return NextResponse.json({ success: true, message: 'Sincronizacion completada exitosamente' });

        } catch (eror) {
            await client.query('ROLLBACK');
            console.error('❌ Error crítico en sync:', eror);
            return NextResponse.json({ success: false, error: eror.message }, { status: 500 });
        } finally {
            client.release();
        }
    }