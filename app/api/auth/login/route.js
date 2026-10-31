import { NextResponse } from "next/server";
import { authenticateInternalUser } from "@/lib/auth";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: "Email y contraseña requeridos" }, { status: 400 });
        }

        const user = await authenticateInternalUser(email, password);

        if (!user) {
            return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 });
        }

        const response = NextResponse.json({
            success: true,
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
            path: "/"
        });

        return response;
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}