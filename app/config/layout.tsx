import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frontend Configuration | Hope",
  description:
    "Configure frontend connections for the Hope mental health platform, including backend URLs and environment settings.",
  keywords: [
    "Hope configuration",
    "backend URL setup",
    "environment settings",
    "Hope admin config",
  ],
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Configure Hope Frontend",
    description:
      "Set up backend connectivity and environment variables for the Hope platform.",
    url: "https://hopementalhealthsupport.xyz/config",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Configure Hope Frontend",
    description:
      "Manage frontend configuration for the Hope mental health app.",
  },
};

export default function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
