import { useState } from "react";
import { Copy, RotateCcw, User, Check } from "lucide-react";
import type { Message } from "../types/chat";
import { useChat } from "../context/ChatContext";
import { Avatar } from "./Avatar";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { actions } = useChat();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start space-x-4 group ${
        isUser ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      {" "}
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? "bg-text-accent" : "bg-anaboli-accent"
        }`}
      >
        {" "}
        {isUser ? (
          <User className="w-5 h-5 text-anaboli-text-primary" />
        ) : (
          <Avatar />
        )}
      </div>
      {/* Message Content */}
      <div
        className={`flex-1 max-w-3xl ${
          isUser ? "flex flex-col items-end" : ""
        }`}
      >
        {" "}
        <div
          className={`relative p-4 rounded-2xl ${
            isUser
              ? "bg-text-accent text-anaboli-text-primary rounded-br-md"
              : "bg-anaboli-secondary text-anaboli-text-primary border border-anaboli-accent rounded-bl-md"
          }`}
        >
          {message.isTyping ? (
            <div className="flex items-center space-x-2">
              {" "}
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-anaboli-text-secondary rounded-full animate-bounce\"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-anaboli-text-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-anaboli-text-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <span className="text-sm text-anaboli-text-secondary ml-2">
                El asistente está pensando...
              </span>
            </div>
          ) : (
            <>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed m-0">
                  {message.content}
                </p>
              </div>
              {/* Message Actions */}{" "}
              <div
                className={`absolute -top-2 ${
                  isUser ? "-left-2" : "-right-2"
                } flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-anaboli-accent rounded-lg p-1`}
              >
                {" "}
                <button
                  onClick={copyToClipboard}
                  className="p-1 text-anaboli-text-secondary hover:text-anaboli-text-primary rounded transition-colors"
                  title="Copiar mensaje"
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                {!isUser && (
                  <button
                    onClick={() => actions.regenerateMessage(message.id)}
                    className="p-1 text-anaboli-text-secondary hover:text-anaboli-text-primary rounded transition-colors"
                    title="Regenerar respuesta"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>{" "}
        {/* Timestamp */}
        <div
          className={`text-xs text-anaboli-text-secondary mt-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
