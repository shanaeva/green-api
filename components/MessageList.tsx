import type { ChatMessage } from "./types";
import { MessageBubble } from "./MessageBubble";

type Props = {
  messages: ChatMessage[];
  phoneNumber: string;
};

export const MessageList = ({ messages, phoneNumber }: Props) => (
  <div
    aria-live="polite"
    className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/70 p-6"
  >
    {messages.length === 0 ? (
      <div className="m-auto flex max-w-sm flex-col items-center text-center">
        <p className="font-medium text-slate-800">
          {phoneNumber ? "Пока нет сообщений" : "Открой чат по номеру телефона"}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {phoneNumber
            ? "Здесь будет отображаться переписка."
            : "Укажи уникальный номер инстанса, ключ доступа инстанса и номер получателя, чтобы начать переписку."}
        </p>
      </div>
    ) : (
      messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))
    )}
  </div>
);
