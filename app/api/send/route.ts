import {
  getGreenApiBaseUrl,
  getGreenApiCredentials,
  getNonEmptyString,
  readJsonObject,
} from "@/lib/server/green-api";

export const POST = async (request: Request) => {
  const input = await readJsonObject(request);
  if (!input) {
    return Response.json(
      { error: "Не удалось прочитать данные запроса." },
      { status: 400 },
    );
  }

  const { idInstance, apiTokenInstance, phoneNumber } =
    getGreenApiCredentials(input);
  const message = getNonEmptyString(input.message);
  const apiUrl = getGreenApiBaseUrl();

  if (!idInstance || !apiTokenInstance || !phoneNumber || !message) {
    return Response.json(
      { error: "Укажи данные инстанса, номер получателя и текст сообщения." },
      { status: 400 },
    );
  }

  if (!apiUrl) {
    return Response.json(
      { error: "Добавь GREEN_API_URL в локальный файл .env.local." },
      { status: 500 },
    );
  }

  let apiResponse: Response;
  try {
    apiResponse = await fetch(
      `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: `${phoneNumber}@c.us`, message }),
        cache: "no-store",
      },
    );
  } catch {
    return Response.json(
      {
        error:
          "Не удалось связаться с GREEN-API. Проверь подключение и apiUrl.",
      },
      { status: 502 },
    );
  }

  if (!apiResponse.ok) {
    return Response.json(
      {
        error: `GREEN-API не принял сообщение (HTTP ${apiResponse.status}).`,
      },
      { status: apiResponse.status },
    );
  }

  let result: unknown;
  try {
    result = await apiResponse.json();
  } catch {
    return Response.json(
      { error: "GREEN-API вернул некорректный ответ при отправке сообщения." },
      { status: 502 },
    );
  }

  const idMessage =
    typeof result === "object" && result !== null && "idMessage" in result
      ? result.idMessage
      : null;

  if (typeof idMessage !== "string" || !idMessage) {
    return Response.json(
      { error: "GREEN-API ответил без идентификатора сообщения." },
      { status: 502 },
    );
  }

  return Response.json({ idMessage });
};
