export interface MessageAction {
  action: "postback";
  label: string;
  value: string;
}

export interface MessageCard {
  type: "card";
  title: string;
  subtitle?: string;
  actions: MessageAction[];
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
  card?: MessageCard;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  soundEnabled: boolean;
  autoSave: boolean;
}
