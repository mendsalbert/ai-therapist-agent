import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface ProgressStepsProps {
  steps: Step[];
  className?: string;
}

export function ProgressSteps({ steps, className }: ProgressStepsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <motion.div
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                step.status === 'completed' && "bg-primary border-primary text-primary-foreground",
                step.status === 'current' && "bg-primary/10 border-primary text-primary",
                step.status === 'pending' && "bg-muted border-muted-foreground/30 text-muted-foreground",
                step.status === 'error' && "bg-destructive/10 border-destructive text-destructive"
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {step.status === 'completed' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
              
              {/* Pulse animation for current step */}
              {step.status === 'current' && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Step Label */}
            <div className="ml-3 min-w-0">
              <p className={cn(
                "text-sm font-medium transition-colors",
                step.status === 'completed' && "text-primary",
                step.status === 'current' && "text-foreground",
                step.status === 'pending' && "text-muted-foreground",
                step.status === 'error' && "text-destructive"
              )}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className={cn(
                  "h-0.5 transition-all duration-500",
                  steps[index + 1].status === 'completed' || steps[index + 1].status === 'current' 
                    ? "bg-primary" 
                    : "bg-muted"
                )} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 