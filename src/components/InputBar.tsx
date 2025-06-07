export default function InputBar() {
  return (
    <div className="flex items-center justify-between p-4">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-grow p-2 border border-anaboli-accent bg-anaboli-base rounded-full focus:outline-none focus:ring-2 focus:ring-text-accent text-text-base"
      />
    </div>
  );
}
