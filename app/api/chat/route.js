import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function converterDrive(url) {
  const id = url.match(/[-\w]{25,}/)?.[0];

  if (!id) {
    throw new Error("Link do Google Drive inválido");
  }

  return `https://drive.google.com/uc?export=view&id=${id}`;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const imagem = converterDrive(body.link);

    const response = await client.responses.create({
      model: "gpt-4.1-mini",

      input: [
        {
          role: "user",

          content: [
            {
              type: "input_text",

              text: `
Analise esta fotografia.

Retorne:
- Nota geral (0–10)
- Composição
- Enquadramento
- Luz
- Nitidez
- Impacto visual
- Sugestões de melhoria

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

    return Response.json({
      resultado: response.output_text,
    });
  } catch (error) {
    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}