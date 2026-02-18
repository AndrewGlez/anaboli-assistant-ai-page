import { useContext } from 'react';
import { ChatStateContext } from '../context/ChatStateContext';
import { ChatDispatchContext } from '../context/ChatDispatchContext';

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