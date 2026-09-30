"use client";

import { useState, type SubmitEvent } from "react";
import { ChatHeader } from "./ChatHeader";
import { ConnectionForm } from "./ConnectionForm";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import type { ChatMessage } from "./types";
import { useIncomingMessages } from "./useIncomingMessages";

type SendResponse = {
  idMessage?: string;
  error?: string;
};

const ChatPanel = () => {
  const [instanceId, setInstanceId] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recipientDraft, setRecipientDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useIncomingMessages({
    apiTokenInstance,
    instanceId,
    phoneNumber,
    setErrorMessage,
    setMessages,
  });

  const hasCredentials = Boolean(instanceId.trim() && apiTokenInstance.trim());
  const canStartChat = Boolean(hasCredentials && recipientDraft.trim());
  const canSendMessage = Boolean(
    hasCredentials && phoneNumber && messageDraft.trim() && !isSending,
  );

  const startChat = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canStartChat) return;

    setPhoneNumber(recipientDraft.trim());
    setMessages([]);
    setErrorMessage("");
    setMessageDraft("");
  };

  const sendMessage = async (event: SubmitEvent<HTMLFormElement>) => {
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
        error instanceof Error
          ? error.message
          : "Не удалось отправить сообщение.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-5 py-8">
      <header className="flex items-center justify-between gap-4 px-5">
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

      <ConnectionForm
        apiTokenInstance={apiTokenInstance}
        instanceId={instanceId}
        onApiTokenInstanceChange={setApiTokenInstance}
        onInstanceIdChange={setInstanceId}
      />

      <section className="flex min-h-[560px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ChatHeader
          canStartChat={canStartChat}
          onRecipientChange={setRecipientDraft}
          onStartChat={startChat}
          phoneNumber={phoneNumber}
          recipientDraft={recipientDraft}
        />

        <MessageList messages={messages} phoneNumber={phoneNumber} />

        {errorMessage && (
          <p
            aria-live="assertive"
            className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <MessageComposer
          canSendMessage={canSendMessage}
          isSending={isSending}
          messageDraft={messageDraft}
          onMessageDraftChange={setMessageDraft}
          onSendMessage={sendMessage}
          phoneNumber={phoneNumber}
        />
      </section>
    </main>
  );
};

export default ChatPanel;
