import type { ChatMessage } from "./types";

type Props = {
  message: ChatMessage;
};

export const MessageBubble = ({ message }: Props) => {
  const isOutgoing = message.direction === "outgoing";

  return (
    <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isOutgoing
            ? "rounded-br-md bg-sky-600 text-white"
            : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.text}
        </p>
        <time
          className={`mt-1 block text-right text-[11px] ${
            isOutgoing ? "text-sky-100" : "text-slate-400"
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
  );
};
