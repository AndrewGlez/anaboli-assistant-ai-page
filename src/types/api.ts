import axios from "axios";
import { fetchEventSource } from "@microsoft/fetch-event-source";

//const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

export interface MessageAction {
  action: "postback";
  label: string;
  value: string;
}

export interface MessageOption {
  label: string;
  value: string;
}

export interface MessageData {
  type?: string;
  data?: {
    id?: string;
    conversationId?: string;
    userId?: string;
    createdAt?: string;
    payload?: {
      text?: string;
      type?: string;
      title?: string;
      subtitle?: string;
      actions?: MessageAction[];
      options?: MessageOption[];
    };
    isBot?: boolean;
  };
  // Legacy structure for backward compatibility
  payload?: {
    text?: string;
    type?: string;
    title?: string;
    subtitle?: string;
    actions?: MessageAction[];
    options?: MessageOption[];
  };
  conversationId?: string;
  id?: string;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_BOTPRESS_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export function generateUserId() {
  return "anaboli_user_" + Math.random().toString(36).substr(2, 9);
}

export async function createUser(id: string, name: string) {
  try {
    const response = await api.post("/users", {
      id,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function createConversation(x_user_key: string, id: string) {
  try {
    const response = await api.post(
      "/conversations",
      {
        id,
      },
      {
        headers: {
          "x-user-key": x_user_key,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

export async function sendMessage(
  x_user_key: string,
  conversationId: string,
  content: string
) {
  try {
    const response = await api.post(
      `/messages`,
      {
        payload: {
          type: "text",
          text: content,
        },
        conversationId,
      },
      {
        headers: {
          "x-user-key": x_user_key,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function getLastMessage(
  conversationId: string,
  x_user_key: string
) {
  try {
    while (true) {
      const response = await api.get(
        `/conversations/${conversationId}/messages`,
        {
          headers: {
            "x-user-key": x_user_key,
          },
        }
      );

      if (response.data.messages[0].userId.includes("anaboli_user_")) {
        console.warn(
          "Last message is from a user, not a bot. Waiting 2 seconds..."
        );
        await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait 2 seconds
        continue; // Loop again
      }

      const message = response.data.messages[0] as MessageData;
      // console.log("Last message fetched:", message);
      return message;
    }
  } catch (error) {
    console.error("Error fetching last message:", error);
    throw error;
  }
}

export function listenToMessages(
  x_user_key: string,
  conversationId: string,
  onMessage: (message: MessageData) => void,
  onError?: (error: Error) => void
) {
  const controller = new AbortController();

  const connectSSE = async () => {
    try {
      await fetchEventSource(
        `${
          import.meta.env.VITE_BOTPRESS_API_URL
        }/conversations/${conversationId}/listen`,
        {
          headers: {
            "x-user-key": x_user_key,
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
          onmessage: (event) => {
            // console.log("Received SSE message:", event.data);
            // Ignore ping messages
            if (event.data === "ping" || event.data.trim() === "ping") return;
            try {
              const parsedData = JSON.parse(event.data);
              onMessage(parsedData);
            } catch (error: unknown) {
              console.error("Error parsing message:", error);
              onError?.(error as Error);
            }
          },
          onerror: (error) => {
            console.error("SSE connection error:", error);
            onError?.(error);
            throw error;
          },
          onopen: async (response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
          },
        }
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("SSE connection error:", error);
        onError?.(error);
      }
    }
  };

  // Start the connection
  connectSSE();

  // Return cleanup function
  return () => {
    controller.abort();
  };
}
