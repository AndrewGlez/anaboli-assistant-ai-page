import type { FallbackProps } from 'react-error-boundary';

export function ChatErrorFallback({ resetErrorBoundary }: FallbackProps) {

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <p className="text-red-400 mb-4">Error en el chat</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-anaboli-accent text-white px-4 py-2 rounded-lg"
      >
        Reintentar
      </button>
    </div>
  );
}