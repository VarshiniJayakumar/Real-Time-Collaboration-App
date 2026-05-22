'use client';

import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkAuth = useStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <html lang="en" className="dark">
      <head>
        <title>SyncSpace — Real-Time Team Collaboration Workspace</title>
        <meta name="description" content="SyncSpace brings teams together. Experience high-end real-time Kanban board syncing, Notion-like documentation notes, and robust Slack-like chat discussions." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#0B0F19] text-[#E5E7EB]">
        {children}
      </body>
    </html>
  );
}
