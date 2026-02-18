export const config = {
  MESSAGE_LIMIT: 10,
  SSE_TIMEOUT_MS: 10000,
  SSE_RETRY_DELAY_MS: 2000,
  USER_ID_PREFIX: 'anaboli_user_',
  CONVERSATION_ID_PREFIX: 'conv_',
  API_ENDPOINTS: {
    USERS: '/users',
    CONVERSATIONS: '/conversations',
    MESSAGES: '/messages',
  } as const,
};

export type Config = typeof config;