import { useEffect, useRef, useMemo, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { useChat } from '../context/ChatContext';
import { AnaboliLogo } from '../assets';
import { Tips } from './Tips';
import { Avatar } from './Avatar';

export function ChatArea() {
  const { state } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const typingMessage = useMemo(
    () =>
      state.isTyping
        ? {
            id: 'typing',
            content: '',
            role: 'assistant' as const,
            timestamp: new Date(),
            isTyping: true,
          }
        : null,
    [state.isTyping]
  );

  const allMessages = useMemo(
    () => [...state.messages, ...(typingMessage ? [typingMessage] : [])],
    [state.messages, typingMessage]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, scrollToBottom]);

  return (
    <div className="flex-1 overflow-y-auto bg-anaboli-primary">
      {' '}
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-anaboli-secondary">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-sm flex items-center justify-center">
            <span className="text-text-base text-xs font-bold">
              <img
                src={AnaboliLogo}
                alt="Asistente Anaboli"
                className="rounded-full object-cover"
              />
            </span>
          </div>
          <span className="text-anaboli-text-primary font-medium">Asistente Anaboli</span>
        </div>
        {/* <div className="flex items-center space-x-2">
          <span className="text-anaboli-text-primary font-medium">Share</span>
          <Share className="w-4 h-4 text-anaboli-text-secondary" />
        </div> */}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        {allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full mb-6 overflow-hidden">
              <Avatar />
            </div>
            {/* Title */}
            <h1 className="text-3xl font-bold text-anaboli-text-primary mb-8">Asistente Anaboli</h1>
            {/* Tips */}
            <Tips />
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-6 p-6">
            {allMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
