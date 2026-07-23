export async function* getMessageCompletion(
  response: Response,
  signal?: AbortSignal,
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No reader");
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const token = decoder.decode(value, { stream: true });
    yield token;

    if (signal?.aborted) {
      await reader.cancel();
      break;
    }
  }
}
