export async function POST(req) {
  try {
    const formData = await req.formData();

    const files = formData.getAll("files");

    return Response.json({
      reply: `Recebi ${files.length} imagens para curadoria.`,
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