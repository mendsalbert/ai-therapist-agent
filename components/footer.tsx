// components/Footer.tsx
"use client";
import Link from "next/link";
import { MessageCircle, Headphones, NotebookPen, Users } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  
  // Hide footer on individual chat conversation pages
  // Hide footer on:
  // - /therapy/[any sessionId] - any sessionId format (not just 24 hex chars)
  // - /matching/chat/[id]
  // - /therapy/memory-enhanced (if it's an active chat session)
  const isIndividualChatPage = pathname && (
    // Match /therapy/[sessionId] where sessionId is not "sessions", "new", "memory-enhanced", or other special routes
    (/^\/therapy\/[^/]+$/.test(pathname) && 
     pathname !== '/therapy' && 
     pathname !== '/therapy/sessions' &&
     pathname !== '/therapy/new' &&
     pathname !== '/therapy/memory-enhanced' &&
     !pathname.startsWith('/therapy/memory-enhanced/sessions')) ||
    // Also hide on memory-enhanced chat page if it has a session
    (pathname === '/therapy/memory-enhanced') ||
    // Match matching chat routes
    pathname.startsWith('/matching/chat/')
  );
  
  // Return null only if it's confirmed to be an individual chat page
  // Otherwise, always show the footer (even if pathname is null during SSR)
  if (isIndividualChatPage) {
    return null;
  }

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-primary/10 shadow-lg"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)' }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Fixed bottom nav with 4 icons - visible on all screen sizes */}
        <div className="py-3 px-2 flex justify-around gap-2">
          <Link 
            href="/therapy" 
            className={`flex flex-col items-center group transition-all duration-200 flex-1 ${
              pathname?.startsWith('/therapy') && !isIndividualChatPage ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-200 ${
              pathname?.startsWith('/therapy') && !isIndividualChatPage
                ? 'bg-primary/10 scale-110' 
                : 'group-hover:bg-primary/5 group-active:scale-95'
            }`}>
              <MessageCircle className={`w-5 h-5 transition-all duration-200 ${
                pathname?.startsWith('/therapy') && !isIndividualChatPage ? 'scale-110' : 'group-hover:scale-110'
              }`} />
            </div>
            <span className="text-[10px] font-medium mt-1">AI Chat</span>
          </Link>
          <Link 
            href="/meditations" 
            className={`flex flex-col items-center group transition-all duration-200 flex-1 ${
              pathname?.startsWith('/meditations') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-200 ${
              pathname?.startsWith('/meditations') 
                ? 'bg-primary/10 scale-110' 
                : 'group-hover:bg-primary/5 group-active:scale-95'
            }`}>
              <Headphones className={`w-5 h-5 transition-all duration-200 ${
                pathname?.startsWith('/meditations') ? 'scale-110' : 'group-hover:scale-110'
              }`} />
            </div>
            <span className="text-[10px] font-medium mt-1">Meditations</span>
          </Link>
          <Link 
            href="/journaling" 
            className={`flex flex-col items-center group transition-all duration-200 flex-1 ${
              pathname?.startsWith('/journaling') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-200 ${
              pathname?.startsWith('/journaling') 
                ? 'bg-primary/10 scale-110' 
                : 'group-hover:bg-primary/5 group-active:scale-95'
            }`}>
              <NotebookPen className={`w-5 h-5 transition-all duration-200 ${
                pathname?.startsWith('/journaling') ? 'scale-110' : 'group-hover:scale-110'
              }`} />
            </div>
            <span className="text-[10px] font-medium mt-1">AI Journal</span>
          </Link>
          <Link 
            href="/community" 
            className={`flex flex-col items-center group transition-all duration-200 flex-1 ${
              pathname?.startsWith('/community') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-200 ${
              pathname?.startsWith('/community') 
                ? 'bg-primary/10 scale-110' 
                : 'group-hover:bg-primary/5 group-active:scale-95'
            }`}>
              <Users className={`w-5 h-5 transition-all duration-200 ${
                pathname?.startsWith('/community') ? 'scale-110' : 'group-hover:scale-110'
              }`} />
            </div>
            <span className="text-[10px] font-medium mt-1">Community</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
