import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProviderWrapper } from "@/components/QueryClientProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gleam POS",
  description: "Modern POS System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProviderWrapper>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
              {/* Primary/Purple Blob */}
              <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/40 rounded-full blur-[100px] opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
              
              {/* Accent/Pink Blob */}
              <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/30 rounded-full blur-[100px] opacity-60 animate-pulse" style={{ animationDuration: '10s' }} />
              
              {/* Success/Green Blob - Subtle addition */}
              <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-success/20 rounded-full blur-[80px] opacity-40 animate-pulse" style={{ animationDuration: '12s' }} />
              
              {/* Background gradient base */}
              <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px]" /> 
            </div>

            {children}
          </TooltipProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
