import { createContext } from 'react';

interface ChatDispatchContextType {
  sendMessage: (content: string) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
  clearChat: () => void;
  removeMessage: (messageId: string) => void;
  handleButtonClick: (buttonValue: string) => Promise<void>;
}

export const ChatDispatchContext = createContext<ChatDispatchContextType | undefined>(undefined);