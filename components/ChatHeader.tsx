import type { SubmitEvent } from "react";

type Props = {
  canStartChat: boolean;
  onRecipientChange: (value: string) => void;
  onStartChat: (event: SubmitEvent<HTMLFormElement>) => void;
  phoneNumber: string;
  recipientDraft: string;
};

export const ChatHeader = ({
  canStartChat,
  onRecipientChange,
  onStartChat,
  phoneNumber,
  recipientDraft,
}: Props) => (
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

    <form className="flex shrink-0 items-center gap-2" onSubmit={onStartChat}>
      <label className="sr-only" htmlFor="recipient-phone">
        Номер телефона получателя
      </label>
      <input
        autoComplete="tel"
        className="h-10 w-56 rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        id="recipient-phone"
        onChange={(event) => onRecipientChange(event.target.value)}
        placeholder="phoneNumber"
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
);
