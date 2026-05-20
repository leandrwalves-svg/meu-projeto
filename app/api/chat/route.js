import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();

    const message = body.message || "Olá";

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: message,
    });

    return Response.json({
      reply: response.output_text,
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