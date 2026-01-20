import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | Hope",
  description:
    "Verify your email to activate your Hope account and start secure AI therapy, journaling, and meditation sessions.",
  keywords: [
    "verify email",
    "Hope email verification",
    "activate Hope account",
    "secure account verification",
  ],
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Verify Your Hope Account",
    description:
      "Confirm your email to unlock AI therapy chats, journaling insights, and guided meditations with Hope.",
    url: "https://hopementalhealthsupport.xyz/verify-email",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Verify Your Hope Account",
    description:
      "Confirm your email to start using Hope for AI therapy, journaling, and community support.",
  },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
