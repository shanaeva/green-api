type ReceiveInput = {
  idInstance?: unknown;
  apiTokenInstance?: unknown;
  phoneNumber?: unknown;
};

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

function getNonEmptyString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const input: ReceiveInput = {
    idInstance: searchParams.get("idInstance"),
    apiTokenInstance: searchParams.get("apiTokenInstance"),
    phoneNumber: searchParams.get("phoneNumber"),
  };

  const idInstance = getNonEmptyString(input.idInstance);
  const apiTokenInstance = getNonEmptyString(input.apiTokenInstance);
  const phoneNumber = getNonEmptyString(input.phoneNumber).replace(/\D/g, "");
  const apiUrl = process.env.GREEN_API_URL?.replace(/\/+$/, "");

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

  try {
    const notificationResponse = await fetch(
      `${methodUrl}/receiveNotification/${apiTokenInstance}?receiveTimeout=5`,
      { cache: "no-store" },
    );

    if (!notificationResponse.ok) {
      return Response.json(
        {
          error: `GREEN-API не вернул уведомление (HTTP ${notificationResponse.status}).`,
        },
        { status: notificationResponse.status },
      );
    }

    const notificationText = await notificationResponse.text();
    const notification = notificationText
      ? (JSON.parse(notificationText) as Notification | null)
      : null;
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

    const deleteResponse = await fetch(
      `${methodUrl}/deleteNotification/${apiTokenInstance}/${notification.receiptId}`,
      { method: "DELETE", cache: "no-store" },
    );

    if (!deleteResponse.ok) {
      return Response.json(
        {
          error: `GREEN-API не подтвердил уведомление (HTTP ${deleteResponse.status}).`,
        },
        { status: deleteResponse.status },
      );
    }

    return Response.json({ message });
  } catch {
    return Response.json(
      {
        error:
          "Не удалось связаться с GREEN-API. Проверь подключение и apiUrl.",
      },
      { status: 502 },
    );
  }
}
