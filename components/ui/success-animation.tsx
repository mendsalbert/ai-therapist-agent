import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Sparkles, Crown, Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessAnimationProps {
  show: boolean;
  title: string;
  description?: string;
  icon?: 'check' | 'crown' | 'heart' | 'sparkles';
  onComplete?: () => void;
  duration?: number;
}

export function SuccessAnimation({ 
  show, 
  title, 
  description, 
  icon = 'check', 
  onComplete,
  duration = 3000 
}: SuccessAnimationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);

      // Auto-complete after duration
      if (onComplete) {
        const timer = setTimeout(onComplete, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, onComplete, duration]);

  const getIcon = () => {
    switch (icon) {
      case 'crown': return Crown;
      case 'heart': return Heart;
      case 'sparkles': return Sparkles;
      default: return CheckCircle;
    }
  };

  const IconComponent = getIcon();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Confetti Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [0, -100, -200],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                delay: particle.id * 0.1,
                ease: "easeOut"
              }}
            />
          ))}

          {/* Main Success Card */}
          <motion.div
            className="bg-background rounded-2xl p-8 shadow-2xl border max-w-md mx-4 text-center"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              delay: 0.2 
            }}
          >
            {/* Success Icon */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.5,
                type: "spring",
                stiffness: 400,
                damping: 10
              }}
            >
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center relative">
                <IconComponent className="w-10 h-10 text-primary" />
                
                {/* Pulse Ring */}
                <motion.div
                  className="absolute inset-0 border-2 border-primary rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Sparkle Effects */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary rounded-full"
                    style={{
                      left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 35}px`,
                      top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 35}px`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: 0.7 + i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Success Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              className="mt-6 w-full bg-muted rounded-full h-2 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/80"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: duration / 1000, delay: 1 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 