import axios from "axios";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

export const api = axios.create({
  baseURL: import.meta.env.VITE_BOTPRESS_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export function generateUserId() {
  return "user_" + Math.random().toString(36).substr(2, 9);
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
      `/conversations/${conversationId}/messages`,
      {
        payload: {
          type: "text",
          text: content,
        },
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
