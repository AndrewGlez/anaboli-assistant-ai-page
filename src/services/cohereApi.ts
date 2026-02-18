import { CohereClientV2, CohereError, CohereTimeoutError } from 'cohere-ai';
import type { CohereResponse } from '../types/api';
import { config } from '../config/index';
import { prompts } from '../config/prompts';

// Initialize Cohere client with API key from config singleton
const cohere = new CohereClientV2({
  token: config.COHERE_API_KEY,
});

/**
 * Sends a chat message to Cohere API and returns a response
 * @param message - User message to send
 * @returns Promise with AI response
 */
export async function sendMessageToCohere(message: string): Promise<CohereResponse> {
  try {
    const response = await cohere.chat({
      model: 'command-r',
      messages: [
        {
          role: 'system',
          content: prompts.system,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    // Extract text content from response - handle potential undefined
    // The content is an array of content items, we need to extract the text from the first item
    let textContent = '';

    if (response.message.content && response.message.content.length > 0) {
      // The content item could be of type TextContent or Thinking
      // We need to check the type and extract text accordingly
      const firstContent = response.message.content[0];
      if (firstContent && 'text' in firstContent) {
        textContent = firstContent.text;
      }
    }

    return {
      text: textContent,
    };
  } catch (error) {
    if (error instanceof CohereTimeoutError) {
      throw new Error('Request to Cohere API timed out');
    } else if (error instanceof CohereError) {
      throw new Error(`Cohere API error: ${error.message}`);
    } else if (error instanceof Error) {
      throw new Error(`Cohere API error: ${error.message}`);
    } else {
      throw new Error('Failed to connect to Cohere API');
    }
  }
}

/**
 * Sends a chat message to Cohere API and streams the response
 * @param message - User message to send
 * @returns Async generator that yields response chunks
 */
export async function* streamMessageToCohere(message: string): AsyncGenerator<string> {
  try {
    const stream = await cohere.chatStream({
      model: 'command-r',
      messages: [
        {
          role: 'system',
          content: prompts.system,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    for await (const chatEvent of stream) {
      if (chatEvent.type === 'content-delta') {
        const deltaMessage = chatEvent.delta?.message;
        if (deltaMessage && typeof deltaMessage === 'string') {
          yield deltaMessage;
        }
      }
    }
  } catch (error) {
    if (error instanceof CohereTimeoutError) {
      throw new Error('Stream request to Cohere API timed out');
    } else if (error instanceof CohereError) {
      throw new Error(`Cohere API stream error: ${error.message}`);
    } else if (error instanceof Error) {
      throw new Error(`Cohere API stream error: ${error.message}`);
    } else {
      throw new Error('Failed to establish stream connection to Cohere API');
    }
  }
}
