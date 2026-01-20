import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Hope Mental Health App",
  description:
    "Sign in to Hope to continue AI therapy chats, journaling, guided meditations, and community support.",
  keywords: [
    "Hope login",
    "mental health app sign in",
    "AI therapy login",
    "meditation app login",
    "journaling app login",
  ],
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Login to Hope",
    description:
      "Access your Hope account to continue AI therapy conversations, journaling, and meditations.",
    url: "https://hopementalhealthsupport.xyz/login",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Login to Hope",
    description:
      "Sign in to access AI therapy, journaling, meditations, and community support.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
