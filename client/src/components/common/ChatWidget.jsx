import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { sendUserChatQuery } from '../../services/api';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input;
    setMessages((prev) => [...prev, { role: 'user', text: userQuery }]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const data = await sendUserChatQuery(userQuery);
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating-toggle-button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-cyan to-cyan-deep text-navy shadow-xl shadow-cyan/30 flex items-center justify-center hover:scale-105 transition-transform"
      >
        {isOpen ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {/* Chat-panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[90vw] h-[480px] bg-white rounded-2xl shadow-2xl border border-hairline overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-2.5 px-5 py-4 bg-navy">
              <div className="w-8 h-8 rounded-lg bg-cyan-dim flex items-center justify-center text-cyan">
                <Bot size={16} />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-text-primary">Civic Assistant</p>
                <p className="font-body text-[11px] text-text-muted">Ask about your reports</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-light">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
                  <Bot size={28} className="text-cyan/50" />
                  <p className="font-body text-xs text-ink/60">
                    Try: Ask me anything about your civic reports
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] px-3.5 py-2 rounded-2xl font-body text-xs shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-cyan text-navy self-end rounded-br-md'
                        : 'bg-white text-ink self-start rounded-bl-md border border-hairline'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))
              )}

              {loading && (
                <div className="self-start bg-white border border-hairline rounded-2xl rounded-bl-md px-4 py-2.5 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              )}
            </div>

            {error && (
              <div className="px-4 py-2 text-[11px] text-status-open border-t border-hairline bg-status-open-bg">
                {error}
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-hairline bg-white">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your reports..."
                maxLength={200}
                className="flex-1 border border-hairline rounded-full px-4 py-2 font-body text-xs text-ink outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-9 h-9 rounded-full bg-cyan text-navy flex items-center justify-center shrink-0 hover:bg-cyan-deep transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;