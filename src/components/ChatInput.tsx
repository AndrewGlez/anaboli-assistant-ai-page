import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";

export function ChatInput() {
  const { state, actions } = useChat();
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (message.trim() && !state.isTyping) {
      actions.sendMessage(message.trim());
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
        <form onSubmit={handleSubmit}>
          <div className="relative">
            {" "}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                state.isTyping
                  ? "El asistente está pensando..."
                  : "Pregunta acerca de nuestros productos..."
              }
              disabled={state.isTyping}
              className="w-full bg-anaboli-secondary border border-anaboli-accent rounded-full overflow-hidden px-6 py-4 text-anaboli-text-primary placeholder-anaboli-text-secondary resize-none focus:outline-none focus:border-anaboli-accent min-h-[56px] max-h-[120px] pr-16 placeholder:text-sm sm:placeholder:text-base"
              rows={1}
            />{" "}
            <button
              type="submit"
              disabled={!message.trim() || state.isTyping}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all ${
                message.trim() && !state.isTyping
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
