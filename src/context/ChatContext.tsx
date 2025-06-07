import React, { createContext, useContext, useReducer } from "react";
import type { Message } from "../types/chat";
import { createUser } from "../types/api";

interface ChatState {
  messages: Message[];
  isTyping: boolean;
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | {
      type: "UPDATE_MESSAGE";
      payload: { messageId: string; updates: Partial<Message> };
    }
  | { type: "SET_TYPING"; payload: boolean };

const initialState: ChatState = {
  messages: [],
  isTyping: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
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

    case "SET_TYPING":
      return { ...state, isTyping: action.payload };

    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  actions: {
    sendMessage: (content: string) => void;
    regenerateMessage: (messageId: string) => void;
  };
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const actions = {
    sendMessage: async (content: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date(),
      };

      await createUser(userMessage.id, "Usuario Anaboli").then((user) => {
        console.log("User created:", user);
      });

      dispatch({ type: "ADD_MESSAGE", payload: userMessage });

      // Simulate AI typing
      dispatch({ type: "SET_TYPING", payload: true });

      // Simulate AI response in Spanish
      setTimeout(() => {
        const responses = [
          `Entiendo que dijiste: "${content}". Como asistente especializado en productos anabólicos, puedo ayudarte con información sobre suplementos, rutinas de entrenamiento y nutrición deportiva.`,
          `Gracias por tu consulta sobre: "${content}". Estoy aquí para brindarte información profesional sobre nuestros productos y asesorarte en tu proceso de desarrollo muscular.`,
          `Perfecto, sobre "${content}" puedo decirte que tenemos varios productos que podrían interesarte. ¿Te gustaría conocer más detalles sobre algún suplemento en particular?`,
        ];

        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          role: "assistant",
          timestamp: new Date(),
        };

        dispatch({ type: "ADD_MESSAGE", payload: aiMessage });
        dispatch({ type: "SET_TYPING", payload: false });
      }, 1500);
    },

    regenerateMessage: async (messageId: string) => {
      const message = state.messages.find((m) => m.id === messageId);
      if (!message || message.role !== "assistant") return;

      dispatch({ type: "SET_TYPING", payload: true });

      setTimeout(() => {
        const newContent = `Respuesta regenerada: ${message.content}`;
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            messageId,
            updates: { content: newContent, timestamp: new Date() },
          },
        });
        dispatch({ type: "SET_TYPING", payload: false });
      }, 1000);
    },
  };

  return (
    <ChatContext.Provider value={{ state, actions }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
