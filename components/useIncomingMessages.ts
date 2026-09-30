import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ChatMessage } from "./types";

type Props = {
  apiTokenInstance: string;
  instanceId: string;
  phoneNumber: string;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
};

type ReceiveResponse = {
  message?: Omit<ChatMessage, "direction"> | null;
  error?: string;
};

export const useIncomingMessages = ({
  apiTokenInstance,
  instanceId,
  phoneNumber,
  setErrorMessage,
  setMessages,
}: Props) => {
  useEffect(() => {
    if (!instanceId.trim() || !apiTokenInstance.trim() || !phoneNumber) return;

    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    const receiveNextMessage = async () => {
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
              : [...currentMessages, { ...result.message!, direction: "incoming" }],
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
    };

    void receiveNextMessage();

    return () => {
      isActive = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [apiTokenInstance, instanceId, phoneNumber, setErrorMessage, setMessages]);
};
