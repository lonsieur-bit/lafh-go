import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  sender: "driver" | "user";
  text: string;
  time: string;
}

const initialMessages: Message[] = [
  { id: 1, sender: "driver", text: "أهلاً أحمد، أنا في الطريق إليك", time: "14:32" },
  { id: 2, sender: "user", text: "أهلاً خالد، شكراً! أنا أمام البوابة الرئيسية", time: "14:33" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      time: `${hh}:${mm}`,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Lightweight mock response to keep flow interactive.
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "driver",
          text: "تم استلام رسالتك، أنا قريب جداً 👌",
          time: `${hh}:${mm}`,
        },
      ]);
    }, 700);
  };

  return (
    <div className="h-full bg-background flex flex-col" dir="rtl">
      <div className="pt-12 px-5 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/app"
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
            aria-label="العودة للرئيسية"
          >
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground font-arabic">خالد الأحمد</p>
            <p className="text-xs text-muted-foreground font-arabic">متصل الآن</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card shadow-elevated text-foreground rounded-bl-sm"
              }`}
            >
              <p className="text-sm font-arabic leading-relaxed">{msg.text}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="bg-card border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="rounded-full font-arabic"
            placeholder="اكتب رسالة..."
          />
          <Button type="submit" size="icon" className="rounded-full shadow-glow" aria-label="إرسال">
            <Send className="w-4 h-4 -rotate-90" />
          </Button>
        </div>
      </form>
    </div>
  );
}
