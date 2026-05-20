"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await response.json();

      setReply(data.reply || data.error);
    } catch (error) {
      setReply("Erro ao conectar.");
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Curadoria IA</h1>

      <input
        type="text"
        placeholder="Cole o link do Drive"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginTop: 20,
        }}
      />

      <button
        onClick={handleAnalyze}
        style={{
          marginTop: 20,
          padding: 12,
          cursor: "pointer",
        }}
      >
        {loading ? "Analisando..." : "Analisar"}
      </button>

      {reply && (
        <div style={{ marginTop: 30 }}>
          <strong>Resposta:</strong>
          <p>{reply}</p>
        </div>
      )}
    </main>
  );
}