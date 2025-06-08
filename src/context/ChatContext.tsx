import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { Message } from "../types/chat";
import {
  createUser,
  createConversation,
  sendMessage as sendApiMessage,
  generateUserId,
  listenToMessages,
  getLastMessage,
  type MessageData,
} from "../types/api";

interface ChatState {
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

interface ChatContextType {
  state: ChatState;
  actions: {
    sendMessage: (content: string) => Promise<void>;
    regenerateMessage: (messageId: string) => Promise<void>;
    clearChat: () => void;
    removeMessage: (messageId: string) => void;
    handleButtonClick: (buttonValue: string) => Promise<void>;
  };
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState); // Cleanup message listener on unmount and when listener changes
  useEffect(() => {
    const cleanup = state.messageListener;
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [state.messageListener]);

  const actions = {
    sendMessage: async (content: string) => {
      // Check if message limit is reached
      if (state.isLimitReached) {
        const limitMessage: Message = {
          id: Date.now().toString(),
          content:
            "Has alcanzado el límite de 10 mensajes. Por favor, reinicia la conversación para continuar.",
          role: "assistant",
          timestamp: new Date(),
        };
        dispatch({ type: "ADD_MESSAGE", payload: limitMessage });
        return;
      }

      try {
        // Create user message
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          role: "user",
          timestamp: new Date(),
        };
        dispatch({ type: "ADD_MESSAGE", payload: userMessage });
        dispatch({ type: "INCREMENT_MESSAGE_COUNT" });
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
          }); // Start listening for messages
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
              const payload = messageData.data?.payload || messageData.payload;

              // Only show message if it's from the bot
              if (isBot === true) {
                // Clear the timeout since we received a response via SSE
                dispatch({ type: "CLEAR_SSE_TIMEOUT" });

                const aiMessage: Message = {
                  id: messageId,
                  content: messageContent || "",
                  role: "assistant",
                  timestamp: new Date(),
                }; // Add card data if it exists
                if (payload?.type === "card") {
                  aiMessage.card = {
                    type: "card",
                    title: payload.title || "",
                    subtitle: payload.subtitle,
                    actions: payload.actions || [],
                  };
                }

                // Add choice data if it exists
                if (payload?.type === "choice") {
                  aiMessage.choice = {
                    type: "choice",
                    text: payload.text || "",
                    options: payload.options || [],
                  };
                }

                dispatch({ type: "ADD_MESSAGE", payload: aiMessage });
                dispatch({ type: "SET_TYPING", payload: false });
              }
            },
            (error: Error) => {
              console.error("Error in message listener:", error);
              dispatch({ type: "SET_TYPING", payload: false });
              dispatch({ type: "CLEAR_SSE_TIMEOUT" });

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
        } // Ensure we have valid values before sending message
        if (currentUserKey && currentConversationId) {
          // Clear any existing timeout
          dispatch({ type: "CLEAR_SSE_TIMEOUT" });

          // Send the actual message through the API
          await sendApiMessage(currentUserKey, currentConversationId, content);

          // Set up a timeout for SSE response
          const sseTimeoutId = window.setTimeout(async () => {
            // console.log("SSE timeout reached, falling back to API");
            try {
              const lastMessage = await getLastMessage(
                currentConversationId!,
                currentUserKey!
              );
              if (lastMessage) {
                const messageContent = lastMessage?.payload?.text;
                const messageId = lastMessage?.id;
                const payload = lastMessage?.payload;
                const aiMessage: Message = {
                  id: messageId || Date.now().toString(),
                  content: messageContent || "",
                  role: "assistant",
                  timestamp: new Date(),
                }; // Add card data if it exists
                if (payload?.type === "card") {
                  aiMessage.card = {
                    type: "card",
                    title: payload.title || "",
                    subtitle: payload.subtitle,
                    actions: payload.actions || [],
                  };
                }

                // Add choice data if it exists
                if (payload?.type === "choice") {
                  aiMessage.choice = {
                    type: "choice",
                    text: payload.text || "",
                    options: payload.options || [],
                  };
                }

                dispatch({ type: "ADD_MESSAGE", payload: aiMessage });
                dispatch({ type: "SET_TYPING", payload: false });
                dispatch({ type: "CLEAR_SSE_TIMEOUT" });
              }
            } catch (fallbackError) {
              console.error("Fallback API call failed:", fallbackError);
              dispatch({ type: "SET_TYPING", payload: false });
              dispatch({ type: "CLEAR_SSE_TIMEOUT" });

              const errorMessage: Message = {
                id: Date.now().toString(),
                content:
                  "Error al recibir la respuesta. Por favor, inténtalo de nuevo.",
                role: "assistant",
                timestamp: new Date(),
              };
              dispatch({ type: "ADD_MESSAGE", payload: errorMessage });
            }
          }, 10000); // 10 second timeout

          // Store the timeout ID
          dispatch({ type: "SET_SSE_TIMEOUT", payload: sseTimeoutId });

          // Clear timeout if SSE responds before timeout
          const originalCleanup = state.messageListener;
          if (originalCleanup) {
            dispatch({
              type: "SET_MESSAGE_LISTENER",
              payload: () => {
                clearTimeout(sseTimeoutId);
                originalCleanup();
              },
            });
          }
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
        // Clear any existing timeout
        dispatch({ type: "CLEAR_SSE_TIMEOUT" });

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

        // Set up timeout for regeneration response
        const sseTimeoutId = window.setTimeout(async () => {
          // console.log(
          //   "SSE timeout reached for regeneration, falling back to API"
          // );
          try {
            const lastMessage = await getLastMessage(
              state.conversationId!,
              state.userKey!
            );
            if (lastMessage) {
              const messageContent =
                lastMessage.data?.payload?.text || lastMessage.payload?.text;
              const payload = lastMessage.data?.payload || lastMessage.payload;

              const updates: Partial<Message> = {
                content: messageContent || "",
                timestamp: new Date(),
              }; // Add card data if it exists
              if (payload?.type === "card") {
                updates.card = {
                  type: "card",
                  title: payload.title || "",
                  subtitle: payload.subtitle,
                  actions: payload.actions || [],
                };
              }

              // Add choice data if it exists
              if (payload?.type === "choice") {
                updates.choice = {
                  type: "choice",
                  text: payload.text || "",
                  options: payload.options || [],
                };
              }

              dispatch({
                type: "UPDATE_MESSAGE",
                payload: {
                  messageId,
                  updates,
                },
              });
              dispatch({ type: "SET_TYPING", payload: false });
              dispatch({ type: "CLEAR_SSE_TIMEOUT" });
            }
          } catch (fallbackError) {
            console.error(
              "Fallback API call failed for regeneration:",
              fallbackError
            );
            dispatch({ type: "SET_TYPING", payload: false });
            dispatch({ type: "CLEAR_SSE_TIMEOUT" });

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
        }, 10000); // 10 second timeout

        // Store the timeout ID
        dispatch({ type: "SET_SSE_TIMEOUT", payload: sseTimeoutId });
      } catch (error) {
        console.error("Error regenerating message:", error);
        dispatch({ type: "SET_TYPING", payload: false });
        dispatch({ type: "CLEAR_SSE_TIMEOUT" });

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
      // Clear any pending timeout
      dispatch({ type: "CLEAR_SSE_TIMEOUT" });
      dispatch({ type: "RESET_CHAT" });
      dispatch({ type: "RESET_MESSAGE_COUNT" });
    },
    removeMessage: (messageId: string) => {
      dispatch({ type: "REMOVE_MESSAGE", payload: messageId });
    },
    handleButtonClick: async (buttonValue: string) => {
      // Handle button clicks by sending the button value as a message
      // Create user message for the button click
      const userMessage: Message = {
        id: Date.now().toString(),
        content: buttonValue,
        role: "user",
        timestamp: new Date(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: userMessage });
      dispatch({ type: "INCREMENT_MESSAGE_COUNT" });

      // Send the button value through the existing sendMessage logic
      if (state.userKey && state.conversationId) {
        try {
          dispatch({ type: "SET_TYPING", payload: true });
          // Clear any existing timeout
          dispatch({ type: "CLEAR_SSE_TIMEOUT" });

          await sendApiMessage(
            state.userKey,
            state.conversationId,
            buttonValue
          );

          // Set up timeout for button click response
          const sseTimeoutId = window.setTimeout(async () => {
            console.log(
              "SSE timeout reached for button click, falling back to API"
            );
            try {
              const lastMessage = await getLastMessage(
                state.conversationId!,
                state.userKey!
              );
              if (lastMessage) {
                const messageContent =
                  lastMessage.data?.payload?.text || lastMessage.payload?.text;
                const messageId =
                  lastMessage.data?.id ||
                  lastMessage.id ||
                  Date.now().toString();
                const payload =
                  lastMessage.data?.payload || lastMessage.payload;

                const aiMessage: Message = {
                  id: messageId,
                  content: messageContent || "",
                  role: "assistant",
                  timestamp: new Date(),
                }; // Add card data if it exists
                if (payload?.type === "card") {
                  aiMessage.card = {
                    type: "card",
                    title: payload.title || "",
                    subtitle: payload.subtitle,
                    actions: payload.actions || [],
                  };
                }

                // Add choice data if it exists
                if (payload?.type === "choice") {
                  aiMessage.choice = {
                    type: "choice",
                    text: payload.text || "",
                    options: payload.options || [],
                  };
                }

                dispatch({ type: "ADD_MESSAGE", payload: aiMessage });
                dispatch({ type: "SET_TYPING", payload: false });
                dispatch({ type: "CLEAR_SSE_TIMEOUT" });
              }
            } catch (fallbackError) {
              console.error(
                "Fallback API call failed for button click:",
                fallbackError
              );
              dispatch({ type: "SET_TYPING", payload: false });
              dispatch({ type: "CLEAR_SSE_TIMEOUT" });

              const errorMessage: Message = {
                id: Date.now().toString(),
                content:
                  "Error al procesar la selección. Por favor, inténtalo de nuevo.",
                role: "assistant",
                timestamp: new Date(),
              };
              dispatch({ type: "ADD_MESSAGE", payload: errorMessage });
            }
          }, 10000); // 10 second timeout

          // Store the timeout ID
          dispatch({ type: "SET_SSE_TIMEOUT", payload: sseTimeoutId });
        } catch (error) {
          console.error("Error handling button click:", error);
          dispatch({ type: "SET_TYPING", payload: false });
          dispatch({ type: "CLEAR_SSE_TIMEOUT" });

          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content:
              "Error al procesar la selección. Por favor, inténtalo de nuevo.",
            role: "assistant",
            timestamp: new Date(),
          };
          dispatch({ type: "ADD_MESSAGE", payload: errorMessage });
        }
      }
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
