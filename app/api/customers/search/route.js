import { NextResponse } from "next/server";
import { searchCustomers } from "@/lib/services/customerService";
import { cookies } from "next/headers";

export async function GET(request) {
    try {
        if (!(await cookies()).get('user_session')?.value) {
            return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        const customers = await searchCustomers(query);

        return NextResponse.json({
            success : true,
            data : customers
        });
    } catch (error) {
        console.error('Error en búsqueda de clientes:', error);
        return NextResponse.json(
            { success : false, error : error.message || 'Error interno del servidor.' },
            { status : 500 }
        );
    }
}