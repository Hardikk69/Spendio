import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { X, Send, Sparkles, Bot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hi! I'm Spendio AI. I can help you with subscription details, billing dates, and usage information. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");

  const quickQuestions = [
    "What are my active subscriptions?",
    "When is my next billing date?",
    "How much am I spending monthly?",
    "Show my subscription history"
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages([...messages, { role: "user", content: userMessage }]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      let response = "";
      
      if (userMessage.toLowerCase().includes("subscription")) {
        response = "You currently have 5 active subscriptions: Netflix (₹649/month), Spotify (₹119/month), Amazon Prime (₹1,499/year), YouTube Premium (₹129/month), and Disney+ Hotstar (₹299/month).";
      } else if (userMessage.toLowerCase().includes("billing") || userMessage.toLowerCase().includes("date")) {
        response = "Your next billing dates are: Netflix on March 5th (₹649), Spotify on March 10th (₹119), and YouTube Premium on March 12th (₹129).";
      } else if (userMessage.toLowerCase().includes("spending") || userMessage.toLowerCase().includes("cost")) {
        response = "Your monthly subscription spending is ₹1,196. This includes Netflix, Spotify, YouTube Premium, and Disney+ Hotstar. Amazon Prime is billed annually.";
      } else if (userMessage.toLowerCase().includes("history")) {
        response = "You've been subscribed to Netflix for 2 years, Spotify for 1.5 years, Amazon Prime for 3 years, YouTube Premium for 8 months, and Disney+ Hotstar for 6 months.";
      } else {
        response = "I can help you with information about your subscriptions, billing dates, spending analysis, and usage statistics. What would you like to know?";
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 1000);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50 group"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 hover:from-blue-700 hover:via-purple-700 hover:to-pink-600 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          title="Ask Spendio AI"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Bot className="w-7 h-7 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          >
            Ask Spendio AI
            <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </motion.div>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-6 z-50 w-96"
          >
            <Card className="shadow-2xl border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Spendio AI</h3>
                    <p className="text-xs text-white/90 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Online & Ready to Help
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white space-y-4">
                {messages.map((message, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg"
                          : "bg-white text-slate-900 border border-slate-200 shadow-sm"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-600">Spendio AI</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Quick Questions */}
                {messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2 pt-2"
                  >
                    <p className="text-xs text-slate-600 font-semibold px-1">Quick questions:</p>
                    {quickQuestions.map((question, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        onClick={() => {
                          setInput(question);
                          setTimeout(handleSend, 100);
                        }}
                        className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
                      >
                        {question}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 rounded-xl border-slate-300 focus:border-purple-400 focus:ring-purple-400"
                  />
                  <Button
                    onClick={handleSend}
                    className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Powered by AI for instant subscription insights
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}