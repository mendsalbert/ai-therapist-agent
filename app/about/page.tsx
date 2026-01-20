"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Heart, Target, Sparkles, Mail, MessageCircleHeart, Smartphone } from "lucide-react";
import { MobileDownloadButton } from "@/components/mobile-download-button";

const missions = [
  {
    icon: <Heart className="w-8 h-8 text-primary" />,
    title: "Our Mission",
    description:
      "Make caring mental health support feel human, accessible, and practical — so anyone can check in, feel heard, and get gentle next steps when they need them.",
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Our Vision",
    description:
      "A world where everyday care is normal: warm AI conversations, simple tools for growth, and communities that feel safe and kind.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: "Our Values",
    description:
      "Warmth over jargon, privacy by default, small steps that add up, and design that reduces friction rather than adding it.",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          About Hope
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Hope is a warm, AI‑guided space for mental wellness. We blend supportive chat with personalized AI that learns your communication style, journaling with AI insights, mood tracking, community spaces, guided meditations, and a weekly wellness review that helps you notice progress without pressure.
        </p>
      </motion.div>

      {/* Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 text-center h-full bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-4 flex justify-center">{mission.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{mission.title}</h3>
              <p className="text-muted-foreground">{mission.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mobile App Download Section */}
      {process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">Download Our Mobile App</h3>
                <p className="text-muted-foreground mb-4">
                  Get the Hope app on your Android device for the best mobile experience.
                </p>
                <MobileDownloadButton variant="default" />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold text-center mb-12">What Makes Hope Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Memory-Enhanced AI Therapy",
              description: "Our AI learns your communication style, preferences, and patterns over time to provide personalized, consistent support that feels like talking to a trusted friend who truly knows you.",
              icon: "🧠",
            },
            {
              title: "Intelligent Journaling",
              description: "Private journaling with AI-powered insights that help you notice patterns, identify triggers, and celebrate growth. CBT thought records available for deeper reflection (Premium).",
              icon: "📔",
            },
            {
              title: "Mood Tracking & Analytics",
              description: "Track your mood daily and see trends over time. Understand your emotional rhythms, identify patterns, and receive personalized insights about your mental wellness journey.",
              icon: "😊",
            },
            {
              title: "Community Support",
              description: "Connect with others in safe, moderated community spaces. Share experiences, ask questions, and support one another. Post anonymously when you need extra privacy.",
              icon: "👥",
            },
            {
              title: "Guided Meditations",
              description: "Curated library of calming meditation sessions designed to reduce stress, improve sleep, and enhance mindfulness. Track your listening progress and build a consistent practice.",
              icon: "🧘",
            },
            {
              title: "Weekly Wellness Reports",
              description: "Receive personalized weekly summaries that highlight your progress, mood trends, and gentle suggestions for continued growth. Celebrate small wins and stay grounded (Premium).",
              icon: "📊",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <Card className="p-6 h-full bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold text-center mb-12">How Hope Works</h2>
        <div className="max-w-4xl mx-auto space-y-6">
          {[
            {
              step: "1",
              title: "Create Your Profile",
              description: "Set up your profile with your goals, challenges, and communication preferences. Our AI learns from your interactions to provide personalized support.",
            },
            {
              step: "2",
              title: "Start Conversations",
              description: "Chat with Hope, our AI therapist, anytime. Share what's on your mind, ask questions, or get support. The AI remembers your preferences and adapts to your style.",
            },
            {
              step: "3",
              title: "Track Your Journey",
              description: "Use journaling, mood tracking, and meditation to build awareness. Weekly reports (Premium) help you see progress and patterns over time.",
            },
            {
              step: "4",
              title: "Connect & Grow",
              description: "Engage with our supportive community, access CBT tools, and use personalized insights to continue your mental wellness journey with confidence.",
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact / Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Contact Us</h3>
              <p className="text-muted-foreground mb-4">
                Have a question, feedback, or need support? We're here to help.
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  Email: <a href="mailto:knsalee@gmail.com" className="text-primary underline hover:text-primary/80">knsalee@gmail.com</a>
                </p>
                <p>
                  Support: <a href="mailto:support@hopementalhealthsupport.xyz" className="text-primary underline hover:text-primary/80">support@hopementalhealthsupport.xyz</a>
                </p>
                <p>
                  Community: Open the app's Community tab to share suggestions or ask for help.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
