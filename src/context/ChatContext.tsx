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
  | { type: "REMOVE_MESSAGE"; payload: string }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_USER_DATA"; payload: { userId: string; userKey: string } }
  | { type: "SET_CONVERSATION_ID"; payload: string }
  | { type: "SET_MESSAGE_LISTENER"; payload: (() => void) | null }
  | { type: "RESET_CHAT" };

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

    case "RESET_CHAT":
      return {
        ...initialState,
        userId: state.userId,
        userKey: state.userKey,
      };

    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  actions: {
    sendMessage: (content: string) => Promise<void>;
    regenerateMessage: (messageId: string) => Promise<void>;
    clearChat: () => void;
    removeMessage: (messageId: string) => void;
  };
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Cleanup message listener on unmount and when listener changes
  useEffect(() => {
    return () => {
      if (state.messageListener) {
        state.messageListener();
      }
    };
  }, [state.messageListener]);


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
        let currentUserKey = state.userKey; // Initialize user and conversation if not already done
        if (!currentUserId || !currentConversationId || !currentUserKey) {
          // Generate user ID
          currentUserId = generateUserId();

          // Create user and get the returned key
          const userResponse = await createUser(
            currentUserId,
            "Usuario Anaboli"
          );
          currentUserKey = userResponse.key || userResponse.id || currentUserId;

          // Validate user key exists
          if (!currentUserKey) {
            throw new Error("No se pudo obtener la clave de usuario");
          }

          // Set user data
          dispatch({
            type: "SET_USER_DATA",
            payload: { userId: currentUserId, userKey: currentUserKey },
          });

          // Generate conversation ID
          currentConversationId =
            "conv_" + Math.random().toString(36).substr(2, 9);

          // Create conversation
          await createConversation(currentUserKey, currentConversationId);

          // Set conversation ID
          dispatch({
            type: "SET_CONVERSATION_ID",
            payload: currentConversationId,
          });

          // Start listening for messages
          const cleanup = listenToMessages(
            currentUserKey,
            currentConversationId,
            (messageData: MessageData) => {
              // Handle incoming message from the bot
              const messageContent =
                messageData.data?.payload?.text || messageData.payload?.text;
              const messageId =
                messageData.data?.id || messageData.id || Date.now().toString();
              const isBot = messageData.data?.isBot;

              // Only show message if it's from the bot and has content
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
              console.error("Error in message listener:", error);
              dispatch({ type: "SET_TYPING", payload: false });

              const errorMessage: Message = {
                id: Date.now().toString(),
                content:
                  "Error al recibir la respuesta. Por favor, inténtalo de nuevo.",
                role: "assistant",
                timestamp: new Date(),
              };
              dispatch({ type: "ADD_MESSAGE", payload: errorMessage });
            }
          );

          // Store the cleanup function
          dispatch({ type: "SET_MESSAGE_LISTENER", payload: cleanup });
        }

        // Ensure we have valid values before sending message
        if (currentUserKey && currentConversationId) {
          // Send the actual message through the API
          await sendApiMessage(currentUserKey, currentConversationId, content);
        } else {
          throw new Error(
            "Usuario o conversación no inicializados correctamente"
          );
        }
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

      // Find the previous user message to regenerate the response
      const messageIndex = state.messages.findIndex((m) => m.id === messageId);
      const userMessageIndex = messageIndex - 1;

      if (
        userMessageIndex < 0 ||
        state.messages[userMessageIndex].role !== "user"
      ) {
        console.error("No user message found before assistant message");
        return;
      }

      const userMessage = state.messages[userMessageIndex];

      if (!state.userKey || !state.conversationId) {
        console.error("User key or conversation ID not available");
        return;
      }

      try {
        dispatch({ type: "SET_TYPING", payload: true });

        // Remove the old assistant message
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            messageId,
            updates: {
              content: "Regenerando respuesta...",
              timestamp: new Date(),
            },
          },
        });

        // Send the user message again to regenerate the response
        await sendApiMessage(
          state.userKey,
          state.conversationId,
          userMessage.content
        );
      } catch (error) {
        console.error("Error regenerating message:", error);
        dispatch({ type: "SET_TYPING", payload: false });

        // Restore original message or show error
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            messageId,
            updates: {
              content:
                "Error al regenerar la respuesta. Por favor, inténtalo de nuevo.",
              timestamp: new Date(),
            },
          },
        });
      }
    },

    clearChat: () => {
      // Clean up message listener before resetting
      if (state.messageListener) {
        state.messageListener();
      }
      dispatch({ type: "RESET_CHAT" });
    },

    removeMessage: (messageId: string) => {
      dispatch({ type: "REMOVE_MESSAGE", payload: messageId });
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
