import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Hope",
  description:
    "Securely create a new password for your Hope account and regain access to AI therapy, journaling, and guided meditations.",
  keywords: [
    "reset password",
    "Hope account recovery",
    "mental health app password reset",
    "secure password change",
  ],
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Reset Your Hope Password",
    description:
      "Set a new password to continue your AI therapy sessions, journaling, and meditation practice.",
    url: "https://hopementalhealthsupport.xyz/reset-password",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Reset Your Hope Password",
    description:
      "Securely update your Hope account password to get back to therapy, journaling, and meditations.",
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
