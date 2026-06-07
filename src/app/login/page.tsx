"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Parola hatalı.");
    }
  }

  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <form
        onSubmit={onSubmit}
        style={{
          background: "#11161f",
          padding: 32,
          borderRadius: 12,
          width: 320,
          border: "1px solid #1e2733",
        }}
      >
        <h1 style={{ fontSize: 20, marginTop: 0 }}>Bunker OS</h1>
        <p style={{ color: "#8a95a5", fontSize: 13, marginTop: 0 }}>Giriş</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parola"
          autoFocus
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #2a3543",
            background: "#0b0e14",
            color: "#e6e6e6",
            marginBottom: 12,
          }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "#4ade80",
            color: "#06210f",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {busy ? "..." : "Giriş"}
        </button>
        {error && <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>}
      </form>
    </main>
  );
}
