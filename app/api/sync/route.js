import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getExternalData } from "@/lib/fakeapi";
import { queries } from "@/lib/queries";

const CUTOFF_DATE = new Date('2026-04-30T23:59:59')

const EXCHANGE_RATES = {
    UDS: 18.50, EUR: 20.00, GBP: 23.50,
    CAD: 13.50, AUD: 12.00, MXN: 1.00
}

export async function POST(request){
    const apikey = process.env.FAKE_API_KEY;
    if(!apikey){
        return NextResponse.json({succes: false, eror: 'Falta configurar FAKE_API_KEY'}, {status: 400});
    }

    const client = await db.getClient();

    try {
        const { users, orders, payments } = await getExternalData(apikey);

        await client.query('BEGIN');

        const validUserIDs = new Set();
        for(const user of users){
            validUserIDs.add(user.id);
            await queries.upsertUser(client, u);
        }

        for (const order of orders){
            if(!validUserIDs.has(order.user.id) || new Date(order.created_at) > CUTOFF_DATE) continue;
            await queries.upsertOrder(client, order)
        }

        for (const payment of payments){
            if(!validUserIDs.has(payment.user.id)) continue;
            const rate = EXCHANGE_RATES[payment.currency];
            if(!rate) continue;

            const paymentDate = new Date(payment.paid_at || payment.created_at);
            if (paymentDate > CUTOFF_DATE) continue;

            await queries.upsertPayment(client, payment);

            const points = Math.floor((payment.amount * rate) / 10.0);
            const fecha = paymentDate.toISOString().split('T')[0];
            const ref = `pago: ${payment.id}`;

            if (payment.status === 'succeeded') {
                await queries.insertPointMovement(client, payment.user.id, fecha, 'pago', ref, points);
            } else if (payment.status === 'refunded') {
                await queries.insertPointMovement(client, payment.user.id, fecha, 'reembolso', ref, -points);
            }
        }

        const deliveredOrders = await queries.getDeliveredOrders(client, CUTOFF_DATE);
        for (const order of deliveredOrders.rows){
            const ref = `orden: ${order.id}`;
            const existing = await queries.checkBonusExists(client, ref);

            if (existing.rowCount === 0){
                const fecha = new Date(order.created_at).toISOString().split('T')[0];
                await queries.insertPointMovement(client, order.user.id, fecha, 'bono_orden_entregada', ref, 250);
            }
        }

        const usersSummary = await queries.getUsersSummary(client, CUTOFF_DATE);
        for(const row of usersSummary.rows) {
            const spent12m = parseFloat(row.spent_12m);
            let tier = 'Bronce'
            if (spent12m > 400000) tier = 'Oro';
            else if (spent12m >= 150000) tier = 'Plata';

            const daysInactive = row.days_inactive !== null ? parseInt(row.days_inactive) : 0;
            const isAtRisk = daysInactive >= 90;

            await queries.updateUserMetrics(
                client, row.total_points, tier, spent12m, isAtRisk, daysInactive, row.id
            )
        }

        await client.query('COMMIT');
        return NextResponse.json({ success: true, message: 'Sincronizacion completada exitosamente' });

    } catch (eror) {
        await client.query('ROLLBACK');
        console.error('Error critico en sync: ', eror);
        return NextResponse.json({ success : false, eror: errorMessage }, { status : 500 });
    } finally {
        client.release();
    }
}