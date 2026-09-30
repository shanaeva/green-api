import type { SubmitEvent } from "react";

type Props = {
  canSendMessage: boolean;
  isSending: boolean;
  messageDraft: string;
  onMessageDraftChange: (value: string) => void;
  onSendMessage: (event: SubmitEvent<HTMLFormElement>) => void;
  phoneNumber: string;
};

export const MessageComposer = ({
  canSendMessage,
  isSending,
  messageDraft,
  onMessageDraftChange,
  onSendMessage,
  phoneNumber,
}: Props) => (
  <form
    className="flex items-end gap-3 border-t border-slate-100 bg-white p-4"
    onSubmit={onSendMessage}
  >
    <label className="sr-only" htmlFor="message-draft">
      Текст сообщения
    </label>
    <textarea
      className="min-h-12 max-h-32 flex-1 resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
      disabled={!phoneNumber}
      id="message-draft"
      onChange={(event) => onMessageDraftChange(event.target.value)}
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
);
