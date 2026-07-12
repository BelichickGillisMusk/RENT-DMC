import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AILaurenWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hi! I\'m Lauren, the AI Assistant for Rent-Ruby. How can I help you today?', sender: 'ai' }
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMessage = { text: message, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Add temporary loading message
    const tempAiMsgRef = { text: '...', sender: 'ai', isTyping: true };
    setMessages(prev => [...prev, tempAiMsgRef]);
    
    try {
      // Prepare chat history for context
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));
      // add latest message
      chatHistory.push({ role: 'user', parts: [{ text: message }] });

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3-flash-preview',
          contents: chatHistory,
          config: {
            systemInstruction: `You are Lauren, the AI Assistant, Building Doorman, Sales Assistant, and Assistant General Manager for Rent-Ruby (specifically 3875 Ruby Street, Oakland CA 94609). 
            You must be helpful, professional, and slightly warm/calming. 
            
            Core responsibilities:
            - Doorman: Acknowledge visitors, provide parking/transit info, handle delivery questions.
            - Sales Assistant: Give details about available units, amenities, neighborhood info, pricing, and encourage applications or tours.
            - Assistant GM: Help current tenants with portal navigation, maintenance requests guidelines, building rules, and rent-related questions.

            Information:
            - Property: 3875 Ruby Street, Oakland CA 94609.
            - Email: hello@rent-ruby.com (Auto forwarded to bryan@norcalcarbmobile.com).
            - Style: You speak concisely, don't use overwhelming amounts of markdown, and occasionally reference the vibrant Oakland soul. Keep answers brief (1-3 paragraphs max) since this is a chat widget.`
          }
        }),
      });

      const data = await response.json();
      
      setMessages(prev => {
        const newMessages = [...prev];
        // replace the typing placeholder
        newMessages[newMessages.length - 1] = {
          text: data.text || data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting right now, please reach out to hello@rent-ruby.com.",
          sender: 'ai'
        };
        return newMessages;
      });
      
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          text: 'Sorry, I encountered an error. Please reach out to hello@rent-ruby.com (forwarded to bryan@norcalcarbmobile.com).',
          sender: 'ai'
        };
        return newMessages;
      });
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            >
              <div className="p-4 bg-zinc-950 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-app-accent flex items-center justify-center text-white font-bold text-xs uppercase shadow-[0_0_15px_rgba(255,95,31,0.5)]">AI</div>
                  <div>
                    <div className="text-white font-bold text-sm tracking-widest uppercase">Agent Lauren</div>
                    <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Online</div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3 bg-zinc-900/50">
                {messages.map((msg, i) => (
                  <div key={i} className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'ai' ? 'bg-zinc-800 text-white self-start rounded-tl-sm' : 'bg-app-accent text-white self-end rounded-tr-sm'}`}>
                    {msg.text}
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-zinc-950 border-t border-white/10 flex items-center gap-2">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Lauren..." 
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-app-accent/50 placeholder:text-white/30"
                />
                <button 
                  onClick={handleSend}
                  className="w-9 h-9 rounded-full bg-app-accent flex items-center justify-center text-white hover:bg-app-accent/90 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4 ml-[-2px]" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-app-accent rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,95,31,0.4)] hover:scale-105 active:scale-95 transition-all outline outline-4 outline-zinc-950"
        >
          {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
        </button>
      </div>
    </>
  );
};
