import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Manage Meditations | Hope",
  description:
    "Administer meditation content for Hope, including uploads, edits, and management tasks.",
  keywords: [
    "Hope admin",
    "meditation management",
    "upload meditations",
    "admin dashboard",
  ],
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Hope Admin - Meditations",
    description:
      "Manage meditation content for the Hope mental health platform.",
    url: "https://hopementalhealthsupport.xyz/admin/meditations",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hope Admin - Meditations",
    description:
      "Administer meditation uploads and management tasks for Hope.",
  },
};

export default function AdminMeditationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
