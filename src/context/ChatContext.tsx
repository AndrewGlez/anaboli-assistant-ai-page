import React, { useContext, useReducer, useEffect, useMemo } from 'react';
import { ChatStateContext } from './ChatStateContext';
import { ChatDispatchContext } from './ChatDispatchContext';
import { chatReducer, initialState } from './chatReducer';
import { sendMessageToCohere } from '../services/cohereApi';
import type { Message } from '../types';

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Cleanup message listener on unmount and when listener changes
  useEffect(() => {
    const cleanup = state.messageListener;
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [state.messageListener]);

  const actions = useMemo(
    () => ({
      sendMessage: async (content: string) => {
        // Check if message limit is reached
        if (state.isLimitReached) {
          const limitMessage: Message = {
            id: Date.now().toString(),
            content:
              'Has alcanzado el límite de 10 mensajes. Por favor, reinicia la conversación para continuar.',
            role: 'assistant',
            timestamp: new Date(),
          };
          dispatch({ type: 'ADD_MESSAGE', payload: limitMessage });
          return;
        }

        try {
          // Create user message
          const userMessage: Message = {
            id: Date.now().toString(),
            content,
            role: 'user',
            timestamp: new Date(),
          };
          dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
          dispatch({ type: 'INCREMENT_MESSAGE_COUNT' });
          dispatch({ type: 'SET_TYPING', payload: true });

          // Send message to Cohere API
          const response = await sendMessageToCohere(content);

          // Add assistant response
          const aiMessage: Message = {
            id: Date.now().toString(),
            content: response.text,
            role: 'assistant',
            timestamp: new Date(),
          };
          dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
          dispatch({ type: 'SET_TYPING', payload: false });
        } catch (error) {
          console.error('Error in sendMessage:', error);
          dispatch({ type: 'SET_TYPING', payload: false });

          // Add error message
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content:
              'Lo siento, ha ocurrido un error al enviar tu mensaje. Por favor, inténtalo de nuevo.',
            role: 'assistant',
            timestamp: new Date(),
          };
          dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        }
      },
      regenerateMessage: async (messageId: string) => {
        const message = state.messages.find((m) => m.id === messageId);
        if (!message || message.role !== 'assistant') return;

        // Find the previous user message to regenerate the response
        const messageIndex = state.messages.findIndex((m) => m.id === messageId);
        const userMessageIndex = messageIndex - 1;

        if (
          userMessageIndex < 0 ||
          !state.messages[userMessageIndex] ||
          state.messages[userMessageIndex].role !== 'user'
        ) {
          console.error('No user message found before assistant message');
          return;
        }

        const userMessage = state.messages[userMessageIndex];

        try {
          dispatch({ type: 'SET_TYPING', payload: true });

          // Remove the old assistant message
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              messageId,
              updates: {
                content: 'Regenerando respuesta...',
                timestamp: new Date(),
              },
            },
          });

          // Send the user message again to regenerate the response
          const response = await sendMessageToCohere(userMessage.content);

          // Update the assistant message with the new response
          const updates: Partial<Message> = {
            content: response.text,
            timestamp: new Date(),
          };

          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              messageId,
              updates,
            },
          });
          dispatch({ type: 'SET_TYPING', payload: false });
        } catch (error) {
          console.error('Error regenerating message:', error);
          dispatch({ type: 'SET_TYPING', payload: false });

          // Restore original message or show error
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              messageId,
              updates: {
                content: 'Error al regenerar la respuesta. Por favor, inténtalo de nuevo.',
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
        dispatch({ type: 'CLEAR_SSE_TIMEOUT' });
        dispatch({ type: 'RESET_CHAT' });
        dispatch({ type: 'RESET_MESSAGE_COUNT' });
      },
      removeMessage: (messageId: string) => {
        dispatch({ type: 'REMOVE_MESSAGE', payload: messageId });
      },
      handleButtonClick: async (buttonValue: string) => {
        // Handle button clicks by sending the button value as a message
        // Create user message for the button click
        const userMessage: Message = {
          id: Date.now().toString(),
          content: buttonValue,
          role: 'user',
          timestamp: new Date(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        dispatch({ type: 'INCREMENT_MESSAGE_COUNT' });

        // Send the button value through the existing sendMessage logic
        try {
          dispatch({ type: 'SET_TYPING', payload: true });

          const response = await sendMessageToCohere(buttonValue);

          // Add assistant response
          const aiMessage: Message = {
            id: Date.now().toString(),
            content: response.text,
            role: 'assistant',
            timestamp: new Date(),
          };
          dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
          dispatch({ type: 'SET_TYPING', payload: false });
        } catch (error) {
          console.error('Error handling button click:', error);
          dispatch({ type: 'SET_TYPING', payload: false });

          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: 'Error al procesar la selección. Por favor, inténtalo de nuevo.',
            role: 'assistant',
            timestamp: new Date(),
          };
          dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        }
      },
    }),
    [state]
  );

  const dispatchValue = useMemo(
    () => ({
      sendMessage: actions.sendMessage,
      regenerateMessage: actions.regenerateMessage,
      clearChat: actions.clearChat,
      removeMessage: actions.removeMessage,
      handleButtonClick: actions.handleButtonClick,
    }),
    [actions]
  );

  return (
    <ChatStateContext.Provider value={{ state }}>
      <ChatDispatchContext.Provider value={dispatchValue}>{children}</ChatDispatchContext.Provider>
    </ChatStateContext.Provider>
  );
}

export function useChat() {
  const stateContext = useContext(ChatStateContext);
  const dispatchContext = useContext(ChatDispatchContext);

  if (!stateContext || !dispatchContext) {
    throw new Error('useChat must be used within ChatProvider');
  }

  return {
    state: stateContext.state,
    ...dispatchContext,
  };
}
