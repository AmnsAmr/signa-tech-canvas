import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, Menu, X, Phone, Mail, User, LogOut, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import AuthModal from './Auth/AuthModal';
import { useImageCache } from '@/hooks/useImageCache';
import { buildUploadUrl } from '@/config/api';
import { useMobileAccessibility } from '@/hooks/useMobileAccessibility';

const StickyHeader = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const location = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { images: logoImages } = useImageCache('logo');
  const logoImage = logoImages[0];
  const { 
    isMobile, 
    shouldUseCompactHeader, 
    scrollThreshold, 
    shouldReduceAnimations 
  } = useMobileAccessibility();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show sticky header after device-appropriate scroll threshold
      setIsVisible(currentScrollY > scrollThreshold);
      
      // Make it more compact based on device type
      const compactThreshold = shouldUseCompactHeader ? 250 : 400;
      setIsCompact(currentScrollY > compactThreshold);
      
      // Hide when scrolling up near the top (adaptive threshold)
      const hideThreshold = scrollThreshold - 50;
      if (currentScrollY < hideThreshold && currentScrollY < lastScrollY) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    const throttledHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.projects'), path: '/portfolio' },
    { name: t('admin.reviews'), path: '/ratings' },
    { name: t('nav.contact'), path: '/contact' }
  ];

  return (
    <>
      {/* Sticky Header */}
      <div 
        className={`fixed top-0 left-0 right-0 z-[60] bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg header-optimized ${
          shouldReduceAnimations 
            ? 'header-essential-transition' 
            : 'header-transition'
        } ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className={`container mx-auto px-4 transition-all duration-300 ${
          isCompact ? 'py-2' : 'py-3'
        }`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center group"
              onClick={() => setIsMenuOpen(false)}
            >
              <img
                src={logoImage?.filename ? buildUploadUrl(logoImage.filename) : '/placeholder.svg'}
                alt="Signa Tech Logo"
                className={`w-auto object-contain transition-all duration-300 ${
                  isCompact ? 'h-6' : 'h-8'
                }`}
                onError={(e) => (e.target as HTMLImageElement).src = '/placeholder.svg'}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.slice(0, 4).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.path) 
                      ? 'text-primary bg-primary/10' 
                      : 'text-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center transition-colors duration-200 ${
                    isActive('/admin') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Desktop Auth */}
              <div className="hidden md:flex items-center space-x-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-2 py-1 text-xs flex items-center rounded transition-colors ${
                        isActive('/dashboard') 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <User className="h-3 w-3 mr-1" />
                      {user?.name}
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={logout}
                      className="text-xs h-7 px-2"
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAuthModal(true)}
                    className="text-xs h-7 px-2"
                  >
                    <User className="h-3 w-3 mr-1" />
                    Login
                  </Button>
                )}
                <LanguageSwitcher />
              </div>

              {/* Quick Actions */}
              <Button 
                asChild 
                size="sm"
                className="bg-gradient-primary text-xs h-7 px-3"
              >
                <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.quote')}
                </Link>
              </Button>

              {/* Mobile Menu Button with proper centering */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hamburger-container p-2 h-8 w-8 touch-manipulation button-centered"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="relative w-4 h-4 icon-centered">
                  <Menu className={`h-4 w-4 absolute transition-all duration-300 ${
                    isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                  }`} />
                  <X className={`h-4 w-4 absolute transition-all duration-300 ${
                    isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                  }`} />
                </div>
              </Button>

              {/* Scroll to Top Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="p-2 h-7 w-7 hidden sm:flex"
                title="Back to top"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden overflow-hidden ${
            shouldReduceAnimations ? 'transition-none' : 'transition-all duration-300'
          } ${
            isMenuOpen ? 'max-h-screen opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}>
            <div className="border-t border-border/50 pt-3 pb-2">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-nav-item block px-3 py-3 text-sm font-medium rounded-lg transition-colors touch-manipulation min-h-[44px] flex items-center ${
                      isActive(item.path) 
                        ? 'text-primary bg-primary/10' 
                        : 'text-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`mobile-nav-item block px-3 py-2 text-sm font-medium rounded-lg flex items-center transition-colors ${
                      isActive('/admin') 
                        ? 'text-primary bg-primary/10' 
                        : 'text-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="h-3 w-3 mr-2" />
                    Admin
                  </Link>
                )}
              </nav>
              
              {/* Mobile Auth Section */}
              <div className="border-t border-border/50 pt-3 mt-3 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`mobile-nav-item block px-3 py-2 text-sm flex items-center rounded-lg transition-colors ${
                        isActive('/dashboard') 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {user?.name} - Dashboard
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-center text-sm"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-center text-sm"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                )}
                <div className="flex justify-center">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button (Mobile) */}
      <Button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 sm:hidden floating-header-button bg-gradient-primary rounded-full h-12 w-12 p-0 shadow-glow touch-manipulation button-centered ${
          shouldReduceAnimations ? 'header-essential-transition' : 'transition-all duration-300'
        } ${
          isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
        title="Back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
};

export default StickyHeader;