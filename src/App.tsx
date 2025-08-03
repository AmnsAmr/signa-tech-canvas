import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import DashboardFallback from "@/components/DashboardFallback";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Portfolio from "./pages/Portfolio";
import Admin from "./pages/Admin";
import ForgotPassword from "./pages/ForgotPassword";
import UserDashboard from "./pages/UserDashboard";
import Ratings from "./pages/Ratings";
import NotFound from "./pages/NotFound";

import ScrollToTop from "./components/ScrollToTop";
import StickyHeader from "./components/StickyHeader";
import { useFavicon } from "./hooks/useFavicon";
import { initPerformanceOptimizations } from "./utils/performanceOptimizer";
import React from 'react';

const queryClient = new QueryClient();

const AppContent = () => {
  // Initialize favicon management
  useFavicon();
  
  // Initialize performance optimizations
  React.useEffect(() => {
    initPerformanceOptimizations();
  }, []);
  
  return (
    <>
      <Toaster />
      <BrowserRouter>
            <ScrollToTop />
            <StickyHeader />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/dashboard" element={<ErrorBoundary fallback={<DashboardFallback />}><UserDashboard /></ErrorBoundary>} />
              <Route path="/ratings" element={<Ratings />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);
;

export default App;
