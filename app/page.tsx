"use client";

import { useState } from "react";

export default function Home() {
  const [link, setLink] = useState("");
  const [resultado, setResultado] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function analisar() {
    setCarregando(true);

    const res = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        link,
      }),
    });

    const data = await res.json();

    setResultado(
      data.resultado || data.error
    );

    setCarregando(false);
  }

  return (
    <main
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: 20,
      }}
    >
      <h1>Análise de Fotos</h1>

      <p>Cole o link público da foto do Google Drive</p>

      <input
        value={link}
        onChange={(e) =>
          setLink(e.target.value)
        }
        style={{
          width: "100%",
          padding: 12,
        }}
      />

      <br />
      <br />

      <button
        onClick={analisar}
      >
        {carregando
          ? "Analisando..."
          : "Analisar"}
      </button>

      <pre
        style={{
          marginTop: 30,
          whiteSpace:
            "pre-wrap",
        }}
      >
        {resultado}
      </pre>
    </main>
  );
}