import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extrairFolderId(url) {
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
  const url =
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType+contains+'image/'&fields=files(id,name)&key=${process.env.GOOGLE_API_KEY}`;

  const res =
    await fetch(url);

  if (!res.ok) {
    const erro =
      await res.text();

    throw new Error(
      erro
    );
  }

  const data =
    await res.json();

  return (
    data.files ||
    []
  );
}

async function analisar(
  url,
  nome
) {
  const r =
    await client.responses.create(
      {
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
- nota (0–10)
- composição
- luz
- enquadramento
- nitidez
- impacto visual
- recomendação

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
      }
    );

  return {
    foto:
      nome,

    resultado:
      r.output_text,
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

    const saida =
      [];

    for (
      const foto of fotos
    ) {
      const imagem =
        `https://drive.google.com/thumbnail?id=${foto.id}&sz=w2000`;

      const r =
        await analisar(
          imagem,
          foto.name
        );

      saida.push(
        r
      );
    }

    return Response.json(
      saida
    );
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