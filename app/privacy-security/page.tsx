"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Shield,
  Lock,
  Key,
  Fingerprint,
  ShieldCheck,
  Eye,
  Database,
  Download,
  Edit,
  Trash2,
  Ban,
  Import,
  Gavel,
  Mail,
  Clock,
  Brain,
  Info,
} from "lucide-react";

export default function PrivacySecurityPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-5xl">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Privacy & Security
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your privacy and security are fundamental to Hope. We are committed to protecting your data with industry-leading security measures and transparent privacy practices.
        </p>
      </motion.div>

      {/* Privacy Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-20"
      >
        <Card className="p-8 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Our Privacy Commitment</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                At Hope, we believe your mental health data is deeply personal and should be treated with the utmost care. We are committed to:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Protecting your data with industry-leading encryption and security measures</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Never selling your personal information to third parties</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Giving you complete control over your data with export and deletion options</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Being transparent about what data we collect and how we use it</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Complying with GDPR, CCPA, and other privacy regulations worldwide</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Data Collection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold mb-8">What Data We Collect</h2>
        <div className="space-y-4">
          {[
            {
              title: "Account Information",
              description: "Email address, username, and password (hashed and encrypted). We use this to create and secure your account.",
              icon: <Key className="w-5 h-5 text-primary" />,
            },
            {
              title: "Profile & Preferences",
              description: "Your goals, challenges, communication style preferences, and interests. This helps us personalize your experience with Hope.",
              icon: <Eye className="w-5 h-5 text-primary" />,
            },
            {
              title: "Therapy Conversations",
              description: "Your chat messages with Hope are stored securely and encrypted. We use these to provide context-aware responses and improve the AI experience. You can delete conversations at any time.",
              icon: <Brain className="w-5 h-5 text-primary" />,
            },
            {
              title: "Journal Entries",
              description: "Your private journal entries are stored locally on your device and encrypted when synced to our servers. Only you can access your journal entries.",
              icon: <Database className="w-5 h-5 text-primary" />,
            },
            {
              title: "Mood & Activity Data",
              description: "Mood tracking data, meditation completion, and wellness metrics. This helps generate personalized insights and weekly reports (Premium).",
              icon: <ShieldCheck className="w-5 h-5 text-primary" />,
            },
            {
              title: "Community Posts (Optional)",
              description: "Posts you create in community spaces. You can post anonymously if you prefer. You have full control to edit or delete your posts at any time.",
              icon: <Shield className="w-5 h-5 text-primary" />,
            },
            {
              title: "Usage Analytics (Optional)",
              description: "Anonymized usage statistics to improve the app experience. Personal information is removed before analysis. You can opt-out in Privacy Settings.",
              icon: <Eye className="w-5 h-5 text-primary" />,
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Data Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold mb-8">How We Protect Your Data</h2>
        <Card className="p-8 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="space-y-6">
            {[
              {
                title: "End-to-End Encryption",
                description: "All data transmitted between your device and our servers is encrypted using TLS 1.3 (HTTPS). We enforce HTTPS-only connections in production.",
                icon: <Lock className="w-5 h-5 text-primary" />,
              },
              {
                title: "Secure Token Storage",
                description: "Authentication tokens are stored using platform-specific secure storage (Android: Encrypted SharedPreferences, iOS: Keychain). Tokens are encrypted and never stored in plain text.",
                icon: <Key className="w-5 h-5 text-primary" />,
              },
              {
                title: "Biometric Authentication",
                description: "Optional fingerprint or face ID authentication adds an extra layer of security to protect your account. Available on supported devices.",
                icon: <Fingerprint className="w-5 h-5 text-primary" />,
              },
              {
                title: "API Security",
                description: "All API requests require authentication via JWT tokens. Server-side requests use API keys. Optional certificate pinning and HMAC signatures provide additional protection.",
                icon: <ShieldCheck className="w-5 h-5 text-primary" />,
              },
              {
                title: "CORS Protection",
                description: "Our backend restricts API access to authorized domains only. Unauthorized origins are blocked to prevent cross-site attacks.",
                icon: <Shield className="w-5 h-5 text-primary" />,
              },
              {
                title: "Session Management",
                description: "Automatic session timeout after 30 minutes of inactivity. Sessions are tracked and refreshed securely to prevent unauthorized access.",
                icon: <Clock className="w-5 h-5 text-primary" />,
              },
              {
                title: "Data Encryption at Rest",
                description: "Sensitive data stored in our database is encrypted. Database connections use secure protocols and credentials are stored securely.",
                icon: <Database className="w-5 h-5 text-primary" />,
              },
              {
                title: "Input Validation & Sanitization",
                description: "All user inputs are validated and sanitized to prevent XSS attacks, SQL injection, and other security vulnerabilities.",
                icon: <ShieldCheck className="w-5 h-5 text-primary" />,
              },
            ].map((feature, index) => (
              <div key={feature.title} className="flex items-start gap-4 pb-6 border-b last:border-b-0 last:pb-0">
                <div className="p-2 rounded-lg bg-primary/10">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Your Rights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold mb-8">Your Privacy Rights</h2>
        <p className="text-muted-foreground mb-6">
          Under GDPR, CCPA, and other privacy regulations, you have the following rights:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Right to Access",
              description: "You can export all your personal data at any time through the Privacy Settings. The export includes your journal entries, conversations, mood data, and preferences in JSON format.",
              icon: <Download className="w-6 h-6 text-primary" />,
            },
            {
              title: "Right to Rectification",
              description: "You can update your profile, preferences, and communication style at any time. Changes are reflected immediately in your personalized AI experience.",
              icon: <Edit className="w-6 h-6 text-primary" />,
            },
            {
              title: "Right to Erasure",
              description: "You can delete your account and all associated data permanently. Deletion is immediate and cannot be undone. You can also delete individual conversations, journal entries, or community posts.",
              icon: <Trash2 className="w-6 h-6 text-primary" />,
            },
            {
              title: "Right to Restrict Processing",
              description: "You can opt-out of analytics, crash reporting, and data collection through Privacy Settings. We respect your choices and will stop processing your data accordingly.",
              icon: <Ban className="w-6 h-6 text-primary" />,
            },
            {
              title: "Right to Data Portability",
              description: "You can export your data in a machine-readable format (JSON) to transfer it to another service or keep a local copy.",
              icon: <Import className="w-6 h-6 text-primary" />,
            },
            {
              title: "Right to Object",
              description: "You can object to certain processing activities, including personalized advertising (we don't use your data for ads) or automated decision-making (you can disable AI personalization).",
              icon: <Gavel className="w-6 h-6 text-primary" />,
            },
          ].map((right, index) => (
            <motion.div
              key={right.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.05 }}
            >
              <Card className="p-6 h-full bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-start gap-4 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">{right.icon}</div>
                  <h3 className="text-lg font-semibold flex-1">{right.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{right.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI & Personalization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="mb-20"
      >
        <Card className="p-8 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">AI & Personalization</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Hope uses advanced AI personalization to provide you with consistent, supportive responses that adapt to your communication style and preferences over time.
              </p>

              <h3 className="text-xl font-semibold mb-3">What We Store for Personalization:</h3>
              <ul className="space-y-2 mb-6 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Communication style preferences (gentle, direct, supportive) - stored based on your explicit choices and inferred patterns</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Behavioral patterns (e.g., preferred conversation topics, response length preferences) - inferred from your usage with confidence scores</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Conversation summaries - compact weekly/monthly summaries instead of full message history to optimize context size</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Long-term goals and focus areas - from your profile and ongoing conversations</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">What We Don't Store:</h3>
              <ul className="space-y-2 mb-6 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Full conversation history after summarization - we convert old conversations into compact summaries</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Sensitive personal or medical details beyond general themes - we focus on patterns, not specific events</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Emotional states or one-off events - we store patterns and preferences, not individual emotional moments</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Your Control:</h3>
              <ul className="space-y-2 mb-6 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>You can disable personalization entirely in your Privacy Settings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>You can view what personalization is being applied and why through the Explainability feature</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>You can reset inferred patterns while keeping your explicit preferences</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>You can override any inferred preference with explicit settings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Personalization data automatically decays over time if not updated (5% per week default), ensuring outdated preferences fade away</span>
                </li>
              </ul>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Personalization is designed to be structured, enforceable, explainable, and reversible - not implicit, hidden, or uncontrolled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <Card className="p-8 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Questions About Privacy & Security?</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                If you have questions about our privacy practices, security measures, or want to exercise your privacy rights, please contact us:
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <a
                    href="mailto:knsalee@gmail.com?subject=Privacy%20%26%20Security%20Inquiry"
                    className="text-primary font-semibold hover:underline"
                  >
                    knsalee@gmail.com
                  </a>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Support Email</p>
                  <a
                    href="mailto:support@hopementalhealthsupport.xyz?subject=Privacy%20%26%20Security%20Inquiry"
                    className="text-primary font-semibold hover:underline"
                  >
                    support@hopementalhealthsupport.xyz
                  </a>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      We typically respond to privacy inquiries within 48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

