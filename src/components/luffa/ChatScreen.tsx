import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Send, Paperclip, Phone, ArrowRight } from "lucide-react";
import driverAvatar from "@/assets/driver-avatar.jpg";

const messages = [
  { id: 1, sender: "driver", text: "أهلاً أحمد، أنا في الطريق إليك", time: "14:32" },
  { id: 2, sender: "user", text: "أهلاً خالد، شكراً! أنا أمام البوابة الرئيسية", time: "14:33" },
  { id: 3, sender: "driver", text: "تمام، أوصل خلال 3 دقائق إن شاء الله", time: "14:33" },
  { id: 4, sender: "user", text: "ممتاز 👍", time: "14:34" },
  { id: 5, sender: "driver", text: "وصلت، السيارة كامري بيضاء أمام البوابة", time: "14:37" },
];

interface ChatScreenProps {
  /** Back navigates to `/app` instead of inert button. */
  embeddedInApp?: boolean;
}

const ChatScreen = ({ embeddedInApp = false }: ChatScreenProps) => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    {/* Header */}
    <div className="pt-12 px-5 pb-3 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        {embeddedInApp ? (
          <Link
            to="/app"
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
            aria-label="العودة للرئيسية"
          >
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
        ) : (
          <button type="button" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </button>
        )}
        <img src={driverAvatar} alt="سائق" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground font-arabic">خالد الأحمد</p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground font-arabic">متصل</span>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <Phone className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
            msg.sender === 'user'
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-card shadow-elevated text-foreground rounded-bl-sm'
          }`}>
            <p className="text-sm font-arabic leading-relaxed">{msg.text}</p>
            <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
              {msg.time}
            </p>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Input */}
    <div className="bg-card border-t border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 bg-secondary rounded-full px-4 py-2.5 flex items-center">
          <span className="text-sm text-muted-foreground font-arabic">اكتب رسالة...</span>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Send className="w-4 h-4 text-primary-foreground -rotate-90" />
        </motion.button>
      </div>
    </div>
  </div>
);

export default ChatScreen;
