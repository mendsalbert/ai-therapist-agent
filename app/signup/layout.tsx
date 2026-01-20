import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Hope Mental Health App",
  description:
    "Create your Hope account to start AI therapy chats, journaling with insights, guided meditations, and supportive community spaces.",
  keywords: [
    "Hope signup",
    "create Hope account",
    "mental health app signup",
    "AI therapy registration",
    "meditation app signup",
  ],
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Create Your Hope Account",
    description:
      "Join Hope for AI therapy, private journaling, guided meditations, and community support.",
    url: "https://hopementalhealthsupport.xyz/signup",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Create Your Hope Account",
    description:
      "Sign up to access AI therapy chats, journaling insights, meditations, and supportive spaces.",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
