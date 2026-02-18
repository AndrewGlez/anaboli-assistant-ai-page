import { config } from '../config';

export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function generateUserId(): string {
  return `${config.USER_ID_PREFIX}${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConversationId(): string {
  return `${config.CONVERSATION_ID_PREFIX}${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMessageId(): string {
  return Date.now().toString();
}