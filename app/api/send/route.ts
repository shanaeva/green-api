type SendMessageInput = {
  idInstance?: unknown;
  apiTokenInstance?: unknown;
  phoneNumber?: unknown;
  message?: unknown;
};

function getNonEmptyString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let input: SendMessageInput;

  try {
    input = (await request.json()) as SendMessageInput;
  } catch {
    return Response.json(
      { error: "Не удалось прочитать данные запроса." },
      { status: 400 },
    );
  }

  const idInstance = getNonEmptyString(input.idInstance);
  const apiTokenInstance = getNonEmptyString(input.apiTokenInstance);
  const phoneNumber = getNonEmptyString(input.phoneNumber).replace(/\D/g, "");
  const message = getNonEmptyString(input.message);
  const apiUrl = process.env.GREEN_API_URL?.replace(/\/+$/, "");

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

  try {
    const apiResponse = await fetch(
      `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: `${phoneNumber}@c.us`, message }),
        cache: "no-store",
      },
    );

    if (!apiResponse.ok) {
      return Response.json(
        { error: `GREEN-API не принял сообщение (HTTP ${apiResponse.status}).` },
        { status: apiResponse.status },
      );
    }

    const result: unknown = await apiResponse.json();
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
  } catch {
    return Response.json(
      { error: "Не удалось связаться с GREEN-API. Проверь подключение и apiUrl." },
      { status: 502 },
    );
  }
}
