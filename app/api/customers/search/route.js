import { NextResponse } from "next/server";
import { searchCustomers } from "@/lib/services/customerService";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q' || '');

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