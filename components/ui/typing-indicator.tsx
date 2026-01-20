import { motion } from "framer-motion";

interface TypingIndicatorProps {
  show: boolean;
  name?: string;
  avatar?: React.ReactNode;
}

export function TypingIndicator({ show, name = "AI Therapist", avatar }: TypingIndicatorProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg"
    >
      {/* Avatar */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {avatar || (
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="text-sm font-medium">{name.charAt(0)}</span>
          </div>
        )}
      </motion.div>

      {/* Typing Animation */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{name}</span>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-muted-foreground"
          >
            is typing
          </motion.div>
        </div>
        
        {/* Animated Dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary/60 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Pulse Background */}
      <motion.div
        className="absolute inset-0 bg-primary/5 rounded-lg"
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
} 