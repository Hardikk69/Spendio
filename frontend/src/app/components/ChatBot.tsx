import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { X, Send, Bot, Minimize2, Maximize2 } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi! I'm your Spendio AI assistant. I can help you with subscription-related queries. How can I assist you today?",
      time: "Just now",
    },
  ]);

  const quickQuestions = [
    "Show my active subscriptions",
    "When is my next payment?",
    "How much am I spending?",
    "What subscriptions can I share?",
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: message,
      time: "Just now",
    };

    setMessages([...messages, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: "bot",
        text: getBotResponse(message),
        time: "Just now",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);

    setMessage("");
  };

  const getBotResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("active") || lowerQuery.includes("subscription")) {
      return "You currently have 8 active subscriptions: Netflix Premium (₹649), Spotify Family (₹179), Microsoft 365 (₹489), Disney+ Hotstar (₹299), Amazon Prime (₹1,499/year), Dropbox Plus (₹800), Adobe Creative Cloud (Paused), and YouTube Premium (Expired). Would you like details on any specific subscription?";
    } else if (lowerQuery.includes("payment") || lowerQuery.includes("next")) {
      return "Your next payments are: Disney+ Hotstar on Feb 18 (₹299), Netflix Premium on Feb 20 (₹649), and Spotify Family on Feb 22 (₹179). All have auto-pay enabled.";
    } else if (lowerQuery.includes("spending") || lowerQuery.includes("cost")) {
      return "Your total monthly spending is ₹4,650 across all subscriptions. This is an increase of ₹450 from last month. Your highest expense is Adobe Creative Cloud at ₹2,999/month (currently paused).";
    } else if (lowerQuery.includes("share") || lowerQuery.includes("split")) {
      return "You can share Netflix Premium and Spotify Family. Currently, you're sharing Netflix with 4 people (saving ₹487/month) and Spotify with 3 people (saving ₹358/month). Your total monthly savings from shared subscriptions is ₹845.";
    } else if (lowerQuery.includes("cancel") || lowerQuery.includes("pause")) {
      return "To pause or cancel a subscription, go to the Subscriptions page, select the subscription you want to modify, click the menu icon, and choose 'Pause' or 'Cancel'. Note that pausing is only available for certain services.";
    } else if (lowerQuery.includes("help")) {
      return "I can help you with: viewing active subscriptions, checking payment schedules, analyzing spending patterns, managing shared subscriptions, and answering questions about auto-pay settings. What would you like to know?";
    } else {
      return "I understand you're asking about your subscriptions. Could you please rephrase your question? You can ask about active subscriptions, payment schedules, spending analysis, or shared subscriptions.";
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-2xl border-2 transition-all ${
        isMinimized ? "h-16" : "h-[600px]"
      }`} style={{ borderColor: 'rgba(95, 125, 110, 0.2)' }}>
        <CardHeader className="pb-3 border-b text-white" style={{ background: 'linear-gradient(135deg, #5F7D6E 0%, #7A9688 100%)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Bot className="w-5 h-5" style={{ color: '#5F7D6E' }} />
              </div>
              <div>
                <CardTitle className="text-base text-white">AI Assistant</CardTitle>
                {!isMinimized && (
                  <Badge className="border-0 text-xs mt-1" style={{ backgroundColor: '#E3B587', color: '#1F2933' }}>
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: '#5F7D6E' }} />
                    Online
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-4 h-[calc(600px-140px)]">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className="max-w-[80%] rounded-lg p-3"
                        style={msg.type === "user" ? {
                          backgroundColor: '#5F7D6E',
                          color: 'white'
                        } : {
                          backgroundColor: '#F7F6F3',
                          color: '#1F2933'
                        }}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs mt-1" style={msg.type === "user" ? {
                          color: 'rgba(255, 255, 255, 0.7)'
                        } : {
                          color: '#6B7280'
                        }}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}

                  {messages.length === 1 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Quick questions:</p>
                      {quickQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickQuestion(question)}
                          className="w-full text-left p-2 text-sm rounded-lg transition-colors"
                          style={{ backgroundColor: '#F7F6F3', border: '1px solid rgba(95, 125, 110, 0.15)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(95, 125, 110, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F7F6F3'}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <div className="p-4 border-t" style={{ borderColor: 'rgba(95, 125, 110, 0.15)' }}>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  style={{ backgroundColor: '#5F7D6E', color: 'white' }}
                  className="hover:opacity-90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: '#6B7280' }}>
                AI responses are informational and read-only
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}