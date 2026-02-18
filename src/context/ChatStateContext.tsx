import { createContext } from 'react';
import type { ChatState } from './chatReducer';

interface ChatStateContextType {
  state: ChatState;
}

export const ChatStateContext = createContext<ChatStateContextType | undefined>(undefined);