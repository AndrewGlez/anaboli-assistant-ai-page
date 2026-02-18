export interface MessageAction {
  action: "postback";
  label: string;
  value: string;
}

export interface MessageOption {
  label: string;
  value: string;
}

export interface MessageData {
  type?: string;
  data?: {
    id?: string;
    conversationId?: string;
    userId?: string;
    createdAt?: string;
    payload?: {
      text?: string;
      type?: string;
      title?: string;
      subtitle?: string;
      actions?: MessageAction[];
      options?: MessageOption[];
    };
    isBot?: boolean;
  };
  // Legacy structure for backward compatibility
  payload?: {
    text?: string;
    type?: string;
    title?: string;
    subtitle?: string;
    actions?: MessageAction[];
    options?: MessageOption[];
  };
  conversationId?: string;
  id?: string;
}
