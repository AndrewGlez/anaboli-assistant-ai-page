import React, { useState, useRef, useEffect, useId } from "react";
import { useChat } from "../context/ChatContext";

export function ChatInput() {
  const { state, sendMessage, clearChat } = useChat();
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();
  const hintId = useId();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !state.isTyping && !state.isLimitReached) {
      sendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {" "}
        {/* Message Counter */}
        {state.messageCount > 0 && (
          <div className="mb-3 text-center">
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                state.isLimitReached
                  ? "bg-red-900/30 text-red-400 border border-red-500/30"
                  : state.messageCount >= 8
                  ? "bg-yellow-900/30 text-yellow-400 border border-yellow-500/30"
                  : "bg-anaboli-secondary text-anaboli-text-secondary border border-anaboli-accent"
              }`}
            >
              {state.isLimitReached
                ? "Límite alcanzado"
                : `${state.messageCount}/${state.messageLimit} mensajes`}
            </span>
          </div>
        )}
        {/* Reset Button when limit reached */}
        {state.isLimitReached && (
          <div className="mb-3 text-center">
            <button
              onClick={clearChat}
              className="bg-text-accent text-white px-4 py-2 rounded-lg hover:bg-text-accent/80 transition-colors text-sm"
            >
              Reiniciar conversación
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <label htmlFor={textareaId} className="sr-only">
              Escribir mensaje
            </label>
            <textarea
              id={textareaId}
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-describedby={hintId}
              placeholder={
                state.isLimitReached
                  ? "Has alcanzado el límite de mensajes"
                  : state.isTyping
                  ? "El asistente está pensando..."
                  : "Pregunta acerca de nuestros productos..."
              }
              disabled={state.isTyping || state.isLimitReached}
              className="w-full bg-anaboli-secondary border border-anaboli-accent rounded-full overflow-hidden px-6 py-4 text-anaboli-text-primary placeholder-anaboli-text-secondary resize-none focus:outline-none focus:border-anaboli-accent min-h-[56px] max-h-[120px] pr-16 placeholder:text-sm sm:placeholder:text-base"
              rows={1}
            />
            <span id={hintId} className="sr-only">
              {state.isTyping ? 'El asistente está pensando...' : 'Pregunta acerca de nuestros productos'}
            </span>
            <button
              type="submit"
              disabled={
                !message.trim() || state.isTyping || state.isLimitReached
              }
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all ${
                message.trim() && !state.isTyping && !state.isLimitReached
                  ? "bg-anaboli-base text-text-base hover:bg-anaboli-text-secondary"
                  : "bg-anaboli-accent text-anaboli-text-secondary cursor-not-allowed"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
