import { useState, useRef, useEffect } from 'react';
import {
  User,
  Bot,
  AlertCircle,
  Send,
  GraduationCap
} from 'lucide-react';

export default function CampusChatbot() {
  const [instruction, setInstruction] = useState('system');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Hello! I am CampusGuide AI. Ask me a question about the reference PDF.'
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customText) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const newMessages = [...messages, { role: 'user', text: textToSend.trim() }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(1);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history,
          instruction
        })
      });
      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = null;
      }
      if (!response.ok) {
        throw new Error(
          data?.error ||
          `The backend returned HTTP ${response.status}. Make sure it is running with "npm run server".`
        );
      }
      if (typeof data?.reply !== 'string' || !data.reply.trim()) {
        throw new Error('The backend returned an invalid response. Check that the server is running.');
      }
      setMessages((prev) => [...prev, { role: 'model', text: data.reply.trim() }]);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
          <h1 className="text-base font-semibold text-slate-800">CampusGuide AI</h1>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>Instructions</span>
          <select
            value={instruction}
            onChange={(event) => {
              setInstruction(event.target.value);
              setMessages([{
                role: 'model',
                text: 'Hello! I am CampusGuide AI. Ask me a question using the selected instructions.'
              }]);
              setError(null);
            }}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
          >
            <option value="system">Built-in system prompt</option>
            <option value="knowledge-base">knowledge-base.txt</option>
          </select>
        </label>
      </header>

      {/* Main Chat Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="space-y-4 pt-2">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-emerald-600 text-white shadow-xs'
                    }`}
                  >
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'rounded-tr-none bg-indigo-600 text-white'
                        : 'rounded-tl-none border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-2 text-xs font-medium text-slate-400">
                    Checking the reference PDF...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-slate-200 bg-white p-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Type your question here..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          CampusGuide AI answers based on the configured reference PDF.
        </p>
      </footer>
    </div>
  );
}