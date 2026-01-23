import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      {/* Animated Background Blobs */}
      {/* Animated Background Blobs - Enhanced for Glassmorphism */}
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

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
