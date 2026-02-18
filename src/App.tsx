import { ErrorBoundary } from 'react-error-boundary';
import { ChatProvider } from "./context/ChatContext";
import { ChatArea } from "./components/ChatArea";
import { ChatInput } from "./components/ChatInput";
import { ChatErrorFallback } from './components/ErrorFallback/ChatErrorFallback';

function App() {
  return (
    <ChatProvider>
      <ErrorBoundary FallbackComponent={ChatErrorFallback}>
        <div className="font-inter h-screen flex flex-col bg-anaboli-primary">
          <ChatArea />
          <ChatInput />
        </div>
      </ErrorBoundary>
    </ChatProvider>
  );
}

export default App;
