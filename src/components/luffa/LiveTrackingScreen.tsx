import { motion } from "framer-motion";
import { Phone, MessageCircle, Share2, Navigation, Clock, Star, Shield } from "lucide-react";
import driverAvatar from "@/assets/driver-avatar.jpg";

const LiveTrackingScreen = () => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    {/* Map area */}
    <div className="flex-1 relative map-pattern bg-secondary">
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80" />
      
      {/* Top bar */}
      <div className="absolute top-12 inset-x-5 z-10">
        <div className="bg-card rounded-2xl p-3 shadow-elevated-lg flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-arabic">السائق في الطريق</p>
            <p className="text-sm font-bold text-foreground font-arabic">يصل خلال 4 دقائق</p>
          </div>
          <button className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold font-arabic">
            مشاركة
          </button>
        </div>
      </div>

      {/* Simulated route */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
        <div className="relative">
          {/* Route line */}
          <div className="w-1 h-40 bg-primary/40 mx-auto rounded-full" />
          {/* Driver pin */}
          <motion.div 
            className="absolute top-4 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="bg-primary rounded-full p-2 shadow-glow">
              <Navigation className="w-4 h-4 text-primary-foreground" />
            </div>
          </motion.div>
          {/* Pickup pin */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <div className="bg-success rounded-full p-2 shadow-lg">
              <div className="w-3 h-3 bg-success-foreground rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ETA badge */}
      <div className="absolute top-1/2 right-8">
        <div className="bg-card rounded-xl px-3 py-2 shadow-elevated text-center">
          <p className="text-lg font-bold text-primary">4</p>
          <p className="text-[9px] text-muted-foreground font-arabic">دقائق</p>
        </div>
      </div>
    </div>

    {/* Bottom sheet */}
    <div className="bg-card rounded-t-3xl -mt-6 relative z-10 px-5 pt-3 pb-4">
      {/* Handle */}
      <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
      
      {/* Driver info */}
      <div className="flex items-center gap-3 mb-4">
        <img src={driverAvatar} alt="سائق" className="w-14 h-14 rounded-full object-cover border-2 border-primary" />
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground font-arabic">خالد الأحمد</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span className="text-xs text-muted-foreground">4.95</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-arabic">كامري 2023</span>
            <span className="text-xs text-muted-foreground">•</span>
            <Shield className="w-3 h-3 text-success" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-arabic">أبيض • ABC 1234</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <motion.button whileTap={{ scale: 0.95 }} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-semibold font-arabic">محادثة</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-semibold font-arabic">اتصال</span>
        </motion.button>
      </div>

      {/* Trip details */}
      <div className="bg-secondary rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-foreground font-arabic">حي الياسمين</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-xs text-foreground font-arabic">مطار الملك خالد الدولي</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-xs text-muted-foreground font-arabic">المبلغ التقديري</span>
          <span className="text-sm font-bold text-primary">45 ر.س</span>
        </div>
      </div>
    </div>
  </div>
);

export default LiveTrackingScreen;
