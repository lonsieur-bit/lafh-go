import { motion } from "framer-motion";
import luffaLogo from "@/assets/luffa-logo.webp";

const SplashScreen = () => (
  <div className="h-full flex flex-col items-center justify-center bg-[#faf9fc] relative overflow-hidden">
    <div className="relative flex items-center justify-center">
      <div className="absolute w-44 h-44 rounded-full bg-primary/10 animate-pulse" />
      <div className="absolute w-36 h-36 rounded-full border-2 border-primary/20" />
      <motion.img
        src={luffaLogo}
        alt="لفة"
        className="w-32 h-32 relative z-10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  </div>
);

export default SplashScreen;
