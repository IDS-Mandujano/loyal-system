import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/services/authService";
import { runFullSync } from "../syncLogic";

export async function POST(request) {
    const sessionCookie = request.cookies.get("user_session")?.value;
    if (!sessionCookie) {
        return NextResponse.json(
            { success: false, error: "No autorizado. Inicia sesión." },
            { status: 401 }
        );
    }

    const session = JSON.parse(sessionCookie);

    const canSync = await hasPermission(session.id, 'execute_sync');
    if (!canSync) {
        return NextResponse.json(
            { success: false, error: "Acceso denegado. No tienes el permiso de execute_sync" },
            { status: 403 }
        );
    }

    try {
        const result = await runFullSync();
        
        return NextResponse.json({ 
            success: true, 
            message: 'Sincronizacion completada exitosamente', 
            result 
        });

    } catch (error) {
        console.error('❌ Error crítico en sync manual:', error);
        return NextResponse.json(
            { success: false, error: error.message }, 
            { status: 500 }
        );
    }
}