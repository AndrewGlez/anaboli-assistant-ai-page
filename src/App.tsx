import { ChatProvider } from "./context/ChatContext";
import { ChatArea } from "./components/ChatArea";
import { ChatInput } from "./components/ChatInput";

function App() {
  return (
    <ChatProvider>
      <div className="font-inter h-screen flex flex-col bg-anaboli-primary">
        <ChatArea />
        <ChatInput />
      </div>
    </ChatProvider>
  );
}

export default App;
