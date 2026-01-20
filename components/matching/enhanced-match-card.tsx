import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Star, 
  Shield, 
  Clock,
  CheckCircle,
  X,
  Sparkles,
  Users,
  Brain
} from "lucide-react";
import { useState } from "react";

interface PotentialMatch {
  id: string;
  name: string;
  age: number;
  challenges: string[];
  goals: string[];
  experienceLevel: string;
  communicationStyle: string;
  compatibility: number;
  sharedChallenges: string[];
  complementaryGoals: string[];
  lastActive: string;
  profileImage?: string;
  bio: string;
  safetyScore: number;
}

interface EnhancedMatchCardProps {
  match: PotentialMatch;
  onAccept: (matchId: string) => void;
  onReject: (matchId: string) => void;
  index: number;
}

export function EnhancedMatchCard({ match, onAccept, onReject, index }: EnhancedMatchCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(match.id);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject(match.id);
    } finally {
      setIsRejecting(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 75) return "text-blue-600 bg-blue-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
        {/* Compatibility Badge */}
        <motion.div
          className="absolute top-3 right-3 z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
        >
          <Badge 
            className={`${getCompatibilityColor(match.compatibility)} font-bold px-3 py-1 shadow-sm`}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {match.compatibility}% Match
          </Badge>
        </motion.div>

        {/* Hover Glow Effect */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        <CardContent className="p-6">
          {/* Profile Section */}
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Avatar className="w-16 h-16 border-2 border-primary/20">
                <AvatarImage src={match.profileImage} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {match.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{match.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {match.age} years
                </Badge>
                {match.safetyScore >= 95 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Shield className="w-4 h-4 text-green-600" />
                  </motion.div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {match.bio}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Active {match.lastActive}</span>
              </div>
            </div>
          </div>

          {/* Shared Challenges */}
          {match.sharedChallenges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="mb-4"
            >
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Shared Challenges
              </p>
              <div className="flex flex-wrap gap-1">
                {match.sharedChallenges.slice(0, 3).map((challenge, i) => (
                  <motion.div
                    key={challenge}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 + i * 0.1 }}
                  >
                    <Badge variant="secondary" className="text-xs">
                      {challenge}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Complementary Goals */}
          {match.complementaryGoals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: index * 0.1 + 0.6 }}
              className="mb-4"
            >
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Star className="w-3 h-3" />
                Complementary Goals
              </p>
              <div className="flex flex-wrap gap-1">
                {match.complementaryGoals.slice(0, 2).map((goal, i) => (
                  <motion.div
                    key={goal}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.7 + i * 0.1 }}
                  >
                    <Badge variant="outline" className="text-xs">
                      {goal}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Communication Style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.8 }}
            className="mb-6"
          >
            <p className="text-xs text-muted-foreground mb-1">Communication Style</p>
            <Badge variant="secondary" className="capitalize">
              <MessageCircle className="w-3 h-3 mr-1" />
              {match.communicationStyle}
            </Badge>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.9 }}
            className="flex gap-3"
          >
            <Button
              onClick={handleReject}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
              disabled={isAccepting || isRejecting}
            >
              {isRejecting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <X className="w-4 h-4" />
                </motion.div>
              ) : (
                <X className="w-4 h-4" />
              )}
              Pass
            </Button>
            
            <Button
              onClick={handleAccept}
              size="sm"
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl"
              disabled={isAccepting || isRejecting}
            >
              {isAccepting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.div>
              ) : (
                <Heart className="w-4 h-4" />
              )}
              Connect
            </Button>
          </motion.div>
        </CardContent>

        {/* Bottom Accent Line */}
        <motion.div
          className="h-1 bg-gradient-to-r from-primary/50 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ originX: 0 }}
        />
      </Card>
    </motion.div>
  );
} 