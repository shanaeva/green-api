"use client";

import { useEffect, useState, type FormEvent } from "react";

type ChatMessage = {
  id: string;
  text: string;
  direction: "outgoing" | "incoming";
  timestamp: number;
};

type SendResponse = {
  idMessage?: string;
  error?: string;
};

type ReceiveResponse = {
  message?: Omit<ChatMessage, "direction"> | null;
  error?: string;
};

export default function ChatPanel() {
  const [instanceId, setInstanceId] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recipientDraft, setRecipientDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!instanceId.trim() || !apiTokenInstance.trim() || !phoneNumber) return;

    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    async function receiveNextMessage() {
      try {
        const response = await fetch("/api/receive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idInstance: instanceId.trim(),
            apiTokenInstance: apiTokenInstance.trim(),
            phoneNumber,
          }),
          signal: controller.signal,
        });
        const result: ReceiveResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Не удалось получить сообщения.");
        }

        if (isActive && result.message) {
          setMessages((currentMessages) =>
            currentMessages.some((message) => message.id === result.message?.id)
              ? currentMessages
              : [
                  ...currentMessages,
                  { ...result.message!, direction: "incoming" },
                ],
          );
          setErrorMessage("");
        }
      } catch (error) {
        if (isActive && !controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Не удалось получить сообщения.",
          );
        }
      } finally {
        if (isActive) timeoutId = setTimeout(receiveNextMessage, 500);
      }
    }

    void receiveNextMessage();

    return () => {
      isActive = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [apiTokenInstance, instanceId, phoneNumber]);

  const hasCredentials = Boolean(instanceId.trim() && apiTokenInstance.trim());
  const canStartChat = Boolean(hasCredentials && recipientDraft.trim());
  const canSendMessage = Boolean(
    hasCredentials && phoneNumber && messageDraft.trim() && !isSending,
  );

  function startChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canStartChat) return;

    setPhoneNumber(recipientDraft.trim());
    setMessages([]);
    setErrorMessage("");
    setMessageDraft("");
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = messageDraft.trim();
    if (!canSendMessage || !message) return;

    setIsSending(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idInstance: instanceId.trim(),
          apiTokenInstance: apiTokenInstance.trim(),
          phoneNumber,
          message,
        }),
      });

      const result: SendResponse = await response.json();
      if (!response.ok || !result.idMessage) {
        throw new Error(result.error || "Не удалось отправить сообщение.");
      }
      const sentMessageId = result.idMessage;

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: sentMessageId,
          text: message,
          direction: "outgoing",
          timestamp: Date.now(),
        },
      ]);
      setMessageDraft("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не удалось отправить сообщение.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-5 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
            Green chat
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Telegram
          </h1>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
          GREEN-API
        </span>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Подключение</h2>
          <p className="mt-1 text-sm text-slate-500">
            Введи данные инстанса GREEN-API, чтобы начать переписку.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Уникальный номер инстанса
            <input
              autoComplete="off"
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
              onChange={(event) => setInstanceId(event.target.value)}
              placeholder="Например, 1101000000"
              value={instanceId}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Токен инстанса
            <input
              autoComplete="new-password"
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
              onChange={(event) => setApiTokenInstance(event.target.value)}
              placeholder="Вставь apiTokenInstance"
              type="password"
              value={apiTokenInstance}
            />
          </label>
        </div>
      </section>

      <section className="flex min-h-[560px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-5 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-800">
              TG
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-slate-900">
                {phoneNumber || "Новый чат"}
              </h2>
              <p className="text-sm text-slate-500">
                {phoneNumber ? "Telegram" : "Укажи номер получателя"}
              </p>
            </div>
          </div>

          <form
            className="flex shrink-0 items-center gap-2"
            onSubmit={startChat}
          >
            <label className="sr-only" htmlFor="recipient-phone">
              Номер телефона получателя
            </label>
            <input
              autoComplete="tel"
              className="h-10 w-56 rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
              id="recipient-phone"
              onChange={(event) => setRecipientDraft(event.target.value)}
              placeholder="Номер телефона"
              type="tel"
              value={recipientDraft}
            />
            <button
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!canStartChat}
              type="submit"
            >
              Открыть
            </button>
          </form>
        </div>

        <div
          aria-live="polite"
          className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/70 p-6"
        >
          {messages.length === 0 ? (
            <div className="m-auto flex max-w-sm flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-slate-200">
                {phoneNumber ? "✉" : "＋"}
              </div>
              <p className="font-medium text-slate-800">
                {phoneNumber ? "Пока нет сообщений" : "Открой чат по номеру телефона"}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {phoneNumber
                  ? "Здесь будет отображаться переписка."
                  : "Укажи данные инстанса и номер получателя, чтобы начать переписку."}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                className={`flex ${message.direction === "outgoing" ? "justify-end" : "justify-start"}`}
                key={message.id}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.direction === "outgoing"
                      ? "rounded-br-md bg-sky-600 text-white"
                      : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {message.text}
                  </p>
                  <time
                    className={`mt-1 block text-right text-[11px] ${
                      message.direction === "outgoing" ? "text-sky-100" : "text-slate-400"
                    }`}
                    dateTime={new Date(message.timestamp).toISOString()}
                  >
                    {new Intl.DateTimeFormat("ru", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(message.timestamp)}
                  </time>
                </div>
              </div>
            ))
          )}
        </div>

        {errorMessage && (
          <p
            aria-live="assertive"
            className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <form
          className="flex items-end gap-3 border-t border-slate-100 bg-white p-4"
          onSubmit={sendMessage}
        >
          <label className="sr-only" htmlFor="message-draft">
            Текст сообщения
          </label>
          <textarea
            className="min-h-12 max-h-32 flex-1 resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            disabled={!phoneNumber}
            id="message-draft"
            onChange={(event) => setMessageDraft(event.target.value)}
            placeholder={phoneNumber ? "Написать сообщение..." : "Сначала открой чат"}
            value={messageDraft}
          />
          <button
            className="h-12 rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canSendMessage}
            type="submit"
          >
            {isSending ? "Отправляем…" : "Отправить"}
          </button>
        </form>
      </section>
    </main>
  );
}
