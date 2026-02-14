import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "牛市预演教 | Pre-Bull Simulation Church",
  description: "叙事说服实验 — AI Agent 辩论观察平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="antialiased">{children}</body>
    </html>
  );
}
