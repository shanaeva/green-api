import {
  getGreenApiBaseUrl,
  getGreenApiCredentials,
  readJsonObject,
} from "@/lib/server/green-api";

type Notification = {
  receiptId?: number;
  body?: {
    typeWebhook?: string;
    timestamp?: number;
    idMessage?: string;
    senderData?: { senderPhoneNumber?: number | string };
    messageData?: {
      typeMessage?: string;
      textMessageData?: { textMessage?: string };
    };
  };
};

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
  const apiUrl = getGreenApiBaseUrl();

  if (!idInstance || !apiTokenInstance || !phoneNumber) {
    return Response.json(
      { error: "Укажи данные инстанса и номер получателя." },
      { status: 400 },
    );
  }

  if (!apiUrl) {
    return Response.json(
      { error: "Добавь GREEN_API_URL в локальный файл .env.local." },
      { status: 500 },
    );
  }

  const methodUrl = `${apiUrl}/waInstance${idInstance}`;

  let notificationResponse: Response;
  try {
    notificationResponse = await fetch(
      `${methodUrl}/receiveNotification/${apiTokenInstance}?receiveTimeout=5`,
      { cache: "no-store" },
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

  if (!notificationResponse.ok) {
    return Response.json(
      {
        error: `GREEN-API не вернул уведомление (HTTP ${notificationResponse.status}).`,
      },
      { status: notificationResponse.status },
    );
  }

  let notification: Notification | null;
  try {
    const notificationText = await notificationResponse.text();
    notification = notificationText
      ? (JSON.parse(notificationText) as Notification | null)
      : null;
  } catch {
    return Response.json(
      { error: "GREEN-API вернул некорректный ответ при получении уведомления." },
      { status: 502 },
    );
  }
  if (!notification || typeof notification.receiptId !== "number") {
    return Response.json({ message: null });
  }

  const body = notification.body;
  const senderPhone = String(
    body?.senderData?.senderPhoneNumber ?? "",
  ).replace(/\D/g, "");
  const text = body?.messageData?.textMessageData?.textMessage;
  const message =
    body?.typeWebhook === "incomingMessageReceived" &&
    senderPhone === phoneNumber &&
    body.messageData?.typeMessage === "textMessage" &&
    typeof text === "string" &&
    text.trim()
      ? {
          id: body.idMessage ?? String(notification.receiptId),
          text,
          timestamp: (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
        }
      : null;

  let deleteResponse: Response;
  try {
    deleteResponse = await fetch(
      `${methodUrl}/deleteNotification/${apiTokenInstance}/${notification.receiptId}`,
      { method: "DELETE", cache: "no-store" },
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

  if (!deleteResponse.ok) {
    return Response.json(
      {
        error: `GREEN-API не подтвердил уведомление (HTTP ${deleteResponse.status}).`,
      },
      { status: deleteResponse.status },
    );
  }

  let deleteResult: unknown;
  try {
    const deleteText = await deleteResponse.text();
    deleteResult = deleteText ? JSON.parse(deleteText) : undefined;
  } catch {
    // A successful HTTP response is enough to return the already-received message.
  }
  if (
    typeof deleteResult === "object" &&
    deleteResult !== null &&
    "result" in deleteResult &&
    deleteResult.result === false
  ) {
    return Response.json(
      { error: "GREEN-API не подтвердил удаление уведомления." },
      { status: 502 },
    );
  }

  return Response.json({ message });
};
