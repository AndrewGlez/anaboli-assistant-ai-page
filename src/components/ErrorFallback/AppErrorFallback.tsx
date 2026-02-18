import type { FallbackProps } from 'react-error-boundary';
import { useErrorBoundary } from 'react-error-boundary';

export function AppErrorFallback({ error }: FallbackProps) {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div className="flex items-center justify-center min-h-screen bg-anaboli-primary">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Algo salió mal</h2>
        <p className="text-anaboli-text-secondary mb-6">{(error as Error).message}</p>
        <button
          onClick={resetBoundary}
          className="bg-anaboli-accent text-white px-6 py-2 rounded-lg"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
