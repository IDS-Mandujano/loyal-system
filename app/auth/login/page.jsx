"use client";

import { useLogin } from "./useLogin";

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  } = useLogin();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#0f172a",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          Sistema de Lealtad
        </h1>
        <p
          style={{
            color: "#64748b",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          Inicia sesión en tu cuenta
        </p>

        {error && (
          <div
            style={{
              padding: "0.75rem",
              marginBottom: "1rem",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "0.375rem",
              }}
            >
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tuempresa.com"
              style={{
                width: "100%",
                padding: "0.625rem",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "0.375rem",
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.625rem",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "0.75rem",
              backgroundColor: loading ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
