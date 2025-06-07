import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { Message } from "../types/chat";
import {
  createUser,
  createConversation,
  sendMessage as sendApiMessage,
  generateUserId,
  listenToMessages,
  type MessageData,
} from "../types/api";

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  userId: string | null;
  conversationId: string | null;
  userKey: string | null;
  messageListener: (() => void) | null;
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | {
      type: "UPDATE_MESSAGE";
      payload: { messageId: string; updates: Partial<Message> };
    }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_USER_DATA"; payload: { userId: string; userKey: string } }
  | { type: "SET_CONVERSATION_ID"; payload: string }
  | { type: "SET_MESSAGE_LISTENER"; payload: (() => void) | null };

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  userId: null,
  conversationId: null,
  userKey: null,
  messageListener: null,
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
  const [state, dispatch] = useReducer(chatReducer, initialState); // Cleanup message listener on unmount
  useEffect(() => {
    return () => {
      if (state.messageListener) {
        state.messageListener();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = {
    sendMessage: async (content: string) => {
      try {
        // Create user message
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          role: "user",
          timestamp: new Date(),
        };
        dispatch({ type: "ADD_MESSAGE", payload: userMessage });
        dispatch({ type: "SET_TYPING", payload: true });
        let currentUserId = state.userId;
        let currentConversationId = state.conversationId;
        let currentUserKey = state.userKey;

        // Initialize user and conversation if not already done
        if (!currentUserId || !currentConversationId || !currentUserKey) {
          // Generate user ID
          currentUserId = generateUserId();

          // Create user and get the returned key
          const userResponse = await createUser(
            currentUserId,
            "Usuario Anaboli"
          );
          currentUserKey = userResponse.key || userResponse.id || currentUserId;
          console.log("User created:", currentUserId, "Key:", currentUserKey); // Set user data
          dispatch({
            type: "SET_USER_DATA",
            payload: { userId: currentUserId!, userKey: currentUserKey! },
          });

          // Generate conversation ID
          currentConversationId =
            "conv_" + Math.random().toString(36).substr(2, 9); // Create conversation
          await createConversation(currentUserKey!, currentConversationId!);
          console.log("Conversation created:", currentConversationId);

          // Set conversation ID
          dispatch({
            type: "SET_CONVERSATION_ID",
            payload: currentConversationId,
          }); // Start listening for messages
          const cleanup = listenToMessages(
            currentUserKey!,
            currentConversationId!,
            (messageData: MessageData) => {
              // Handle incoming message from the bot
              // Check for new structure first, then fall back to legacy structure
              const messageContent =
                messageData.data?.payload?.text || messageData.payload?.text;
              const messageId =
                messageData.data?.id || messageData.id || Date.now().toString();
              const isBot = messageData.data?.isBot;

              // Only show message if it's from the bot
              if (messageContent && isBot === true) {
                const aiMessage: Message = {
                  id: messageId,
                  content: messageContent,
                  role: "assistant",
                  timestamp: new Date(),
                };
                dispatch({ type: "ADD_MESSAGE", payload: aiMessage });
                dispatch({ type: "SET_TYPING", payload: false });
              }
            },
            (error: Error) => {
              dispatch({ type: "SET_TYPING", payload: false });
              // Add error message
              // const errorMessage: Message = {
              //   id: Date.now().toString(),
              //   content:
              //     "Error al recibir la respuesta. Por favor, inténtalo de nuevo.",
              //   role: "assistant",
              //   timestamp: new Date(),
              // };
              // dispatch({ type: "ADD_MESSAGE", payload: errorMessage });
            }
          );

          // Store the cleanup function
          dispatch({ type: "SET_MESSAGE_LISTENER", payload: cleanup });
        }

        // Send message to API
        const response = await sendApiMessage(
          currentUserKey!,
          currentConversationId!,
          content
        );
        console.log("Message sent:", response);
      } catch (error) {
        console.error("Error in sendMessage:", error);
        dispatch({ type: "SET_TYPING", payload: false });

        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "Lo siento, ha ocurrido un error al enviar tu mensaje. Por favor, inténtalo de nuevo.",
          role: "assistant",
          timestamp: new Date(),
        };
        dispatch({ type: "ADD_MESSAGE", payload: errorMessage });
      }
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
