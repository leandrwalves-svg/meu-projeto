import OpenAI from "openai";
import { google } from "googleapis";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extrairFolderId(url) {
  const match = url.match(/folders\/([^?]+)/);

  if (!match) {
    throw new Error(
      "Link da pasta do Google Drive inválido"
    );
  }

  return match[1];
}

async function listarFotos(folderId) {
  const drive = google.drive({
    version: "v3",

    auth: process.env.GOOGLE_API_KEY,
  });

  const resposta =
    await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/'`,

      fields:
        "files(id,name,mimeType)",
    });

  return resposta.data.files || [];
}

async function analisarImagem(
  nome,
  imagem
) {
  const resposta =
    await client.responses.create({
      model: "gpt-4.1-mini",

      input: [
        {
          role: "user",

          content: [
            {
              type: "input_text",

              text: `
Avalie esta fotografia.

Retorne:
- Nota geral (0–10)
- Composição
- Enquadramento
- Luz
- Nitidez
- Impacto visual
- Sugestão de melhoria

Responda em português.
`,
            },

            {
              type: "input_image",

              image_url: imagem,
            },
          ],
        },
      ],
    });

  return {
    foto: nome,

    avaliacao:
      resposta.output_text,
  };
}

export async function POST(
  req
) {
  try {
    const body =
      await req.json();

    const folderId =
      extrairFolderId(
        body.link
      );

    const fotos =
      await listarFotos(
        folderId
      );

    if (
      !fotos.length
    ) {
      return Response.json({
        erro:
          "Nenhuma foto encontrada",
      });
    }

    const resultado =
      [];

    for (
      const foto of fotos
    ) {
      const imagem =
        `https://drive.google.com/uc?id=${foto.id}`;

      const analise =
        await analisarImagem(
          foto.name,
          imagem
        );

      resultado.push(
        analise
      );
    }

    return Response.json(
      resultado
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error.message,
      },

      {
        status: 500,
      }
    );
  }
}