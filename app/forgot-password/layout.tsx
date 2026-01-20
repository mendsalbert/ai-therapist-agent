import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Hope",
  description:
    "Request a secure password reset link to regain access to your Hope mental health account.",
  keywords: [
    "Hope password reset",
    "forgot password",
    "reset Hope account",
    "mental health app password reset",
  ],
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Reset Your Hope Password",
    description:
      "Send a secure password reset link for your Hope AI therapy and journaling account.",
    url: "https://hopementalhealthsupport.xyz/forgot-password",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Reset Your Hope Password",
    description:
      "Request a password reset to continue using Hope for AI therapy, journaling, and meditations.",
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
