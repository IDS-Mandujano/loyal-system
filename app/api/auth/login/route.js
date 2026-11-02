import { NextResponse } from "next/server";
import { authenticateInternalUser } from "@/lib/services/authService";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: "Email y contraseña requeridos" }, { status: 400 });
        }

        const user = await authenticateInternalUser(email, password);

        if (user?.error) {
            return NextResponse.json({ success: false, error: user.error }, { status: 423 });
        }

        if (!user) {
            return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 });
        }

        const response = NextResponse.json({
            success: true,
            message : 'Inicio de sesión exitoso.',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role_name
            }
        });

        response.cookies.set("user_session", JSON.stringify({ id: user.id, roleId: user.role_id }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge : 60 * 60 * 24 * 7,
            path: "/"
        });

        return response

    } catch (error) {
        if (error.message === 'Usuario desactivado') {
            return NextResponse.json({ success: false, error: 'El usuario está desactivado.' }, { status: 403 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}