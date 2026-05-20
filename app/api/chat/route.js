import OpenAI from "openai";
import { google } from "googleapis";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const credentials = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON
);

const auth =
  new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

function pegarFolderId(url) {
  const match =
    url.match(/folders\/([^?]+)/);

  if (!match) {
    throw new Error(
      "Link da pasta inválido"
    );
  }

  return match[1];
}

async function listarFotos(folderId) {
  const drive =
    google.drive({
      version: "v3",
      auth,
    });

  const res =
    await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
      fields:
        "files(id,name)",
    });

  return (
    res.data.files ||
    []
  );
}

async function analisar(
  url
) {
  const r =
    await client.responses.create({
      model:
        "gpt-4.1-mini",

      input: [
        {
          role:
            "user",

          content:
            [
              {
                type:
                  "input_text",

                text:
                  `
Avalie esta fotografia.

Retorne:
- Nota geral (0–10)
- Composição
- Enquadramento
- Luz
- Nitidez
- Impacto visual
- Melhorias

Responda em português.
`,
              },

              {
                type:
                  "input_image",

                image_url:
                  url,
              },
            ],
        },
      ],
    });

  return r.output_text;
}

export async function POST(
  req
) {
  try {
    const body =
      await req.json();

    const folderId =
      pegarFolderId(
        body.link
      );

    const fotos =
      await listarFotos(
        folderId
      );

    if (
      fotos.length ===
      0
    ) {
      return Response.json({
        error:
          "Nenhuma foto encontrada",
      });
    }

    const resultado =
      [];

    for (
      const foto of fotos
    ) {
      const url =
        `https://drive.google.com/thumbnail?id=${foto.id}&sz=w2000`;

      const texto =
        await analisar(
          url
        );

      resultado.push({
        foto:
          foto.name,

        analise:
          texto,
      });
    }

    return Response.json({
      total:
        resultado.length,

      resultado,
    });
  } catch (
    error
  ) {
    return Response.json(
      {
        error:
          error.message,
      },
      {
        status:
          500,
      }
    );
  }
}