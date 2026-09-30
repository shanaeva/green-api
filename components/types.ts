export type ChatMessage = {
  id: string;
  text: string;
  direction: "outgoing" | "incoming";
  timestamp: number;
};
