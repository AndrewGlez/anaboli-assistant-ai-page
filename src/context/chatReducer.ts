import type { Message } from '../types/chat';

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  userId: string | null;
  conversationId: string | null;
  userKey: string | null;
  messageListener: (() => void) | null;
  messageCount: number;
  messageLimit: number;
  isLimitReached: boolean;
  sseTimeoutId: number | null;
}

export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | {
      type: "UPDATE_MESSAGE";
      payload: { messageId: string; updates: Partial<Message> };
    }
  | { type: "REMOVE_MESSAGE"; payload: string }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_USER_DATA"; payload: { userId: string; userKey: string } }
  | { type: "SET_CONVERSATION_ID"; payload: string }
  | { type: "SET_MESSAGE_LISTENER"; payload: (() => void) | null }
  | { type: "INCREMENT_MESSAGE_COUNT" }
  | { type: "RESET_MESSAGE_COUNT" }
  | { type: "SET_SSE_TIMEOUT"; payload: number | null }
  | { type: "CLEAR_SSE_TIMEOUT" }
  | { type: "RESET_CHAT" };

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  userId: null,
  conversationId: null,
  userKey: null,
  messageListener: null,
  messageCount: 0,
  messageLimit: 10,
  isLimitReached: false,
  sseTimeoutId: null,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.messageId
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };

    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.payload),
      };

    case "SET_TYPING":
      return { ...state, isTyping: action.payload };

    case "SET_USER_DATA":
      return {
        ...state,
        userId: action.payload.userId,
        userKey: action.payload.userKey,
      };

    case "SET_CONVERSATION_ID":
      return {
        ...state,
        conversationId: action.payload,
      };

    case "SET_MESSAGE_LISTENER":
      return {
        ...state,
        messageListener: action.payload,
      };
    case "INCREMENT_MESSAGE_COUNT": {
      const newCount = state.messageCount + 1;
      return {
        ...state,
        messageCount: newCount,
        isLimitReached: newCount >= state.messageLimit,
      };
    }

    case "RESET_MESSAGE_COUNT":
      return {
        ...state,
        messageCount: 0,
        isLimitReached: false,
      };
    case "RESET_CHAT":
      return {
        ...initialState,
        userId: state.userId,
        userKey: state.userKey,
      };

    case "SET_SSE_TIMEOUT":
      return {
        ...state,
        sseTimeoutId: action.payload,
      };

    case "CLEAR_SSE_TIMEOUT":
      if (state.sseTimeoutId) {
        clearTimeout(state.sseTimeoutId);
      }
      return {
        ...state,
        sseTimeoutId: null,
      };

    default:
      return state;
  }
}

export { initialState };