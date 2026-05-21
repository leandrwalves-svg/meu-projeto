"use client";

import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!files.length) return;

    setLoading(true);

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setReply(data.reply || data.error);
    } catch (error) {
      setReply("Erro ao analisar imagens.");
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Curadoria IA</h1>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) =>
          setFiles(e.target.files ? Array.from(e.target.files) : [])
        }
      />

      <button
        onClick={handleUpload}
        style={{
          marginTop: 20,
          padding: 12,
          cursor: "pointer",
        }}
      >
        {loading ? "Analisando..." : "Analisar Fotos"}
      </button>

      {reply && (
        <div style={{ marginTop: 30 }}>
          <strong>Resultado:</strong>
          <p>{reply}</p>
        </div>
      )}
    </main>
  );
}