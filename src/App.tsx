import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { DashboardContent } from "@/components/DashboardContent";
import { VoiceCompanion } from "@/components/VoiceCompanion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<DashboardContent />} />
                <Route path="/appointments" element={<DashboardContent />} />
                <Route path="/medications" element={<DashboardContent />} />
                <Route path="/profile" element={<DashboardContent />} />
                <Route path="/notifications" element={<DashboardContent />} />
                <Route path="/settings" element={<DashboardContent />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <VoiceCompanion />
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
