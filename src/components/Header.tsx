import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, Mail, User, LogOut, Shield, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import AuthModal from './Auth/AuthModal';
import Logo from '@/assets/Logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('down');
  const location = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(scrollY);
      setIsScrolled(scrollY > 20);
      setIsMinimized(scrollY > 100 && scrollDirection === 'down');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, scrollDirection]);

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
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-medium' 
          : 'bg-background/95 backdrop-blur-sm border-b border-border shadow-soft'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Main navigation */}
      <div className={`container mx-auto px-4 transition-all duration-300 ${
        isMinimized && !isHovered ? 'py-1' : isScrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo with enhanced effects */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img 
                src={Logo} 
                alt="Signa Tech Logo" 
                className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                  isMinimized && !isHovered ? 'h-6' : isScrolled ? 'h-8' : 'h-12'
                }`}
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
              />
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 rounded-lg blur-xl transition-opacity duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation with enhanced styling */}
          <nav className={`hidden lg:flex items-center space-x-1 transition-all duration-300 ${
            isMinimized && !isHovered ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 pointer-events-auto scale-100'
          }`}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 font-medium transition-all duration-300 rounded-lg group ${
                  isActive(item.path) 
                    ? 'text-primary bg-primary/10' 
                    : 'text-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                <span className="relative z-10">{item.name}</span>
                {isActive(item.path) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-primary rounded-full"></div>
                )}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`relative px-4 py-2 font-medium transition-all duration-300 rounded-lg group flex items-center ${
                  isActive('/admin') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                <Shield className="h-4 w-4 mr-1 transition-transform group-hover:scale-110" />
                <span className="relative z-10">Admin</span>
                {isActive('/admin') && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-primary rounded-full"></div>
                )}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
              </Link>
            )}
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 text-sm flex items-center transition-all duration-300 rounded-lg hover:bg-primary/5 ${
                      isActive('/dashboard') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <User className="h-4 w-4 mr-2 transition-transform hover:scale-110" />
                    <span className="font-medium">{user?.name}</span>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="flex items-center hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300"
                >
                  <User className="h-4 w-4 mr-1" />
                  Login
                </Button>
              )}
              <Button 
                asChild 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              >
                <Link to="/contact" className="relative z-10">
                  <span>{t('nav.quote')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
              </Button>
            </div>
          </nav>

          {/* Enhanced mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className={`lg:hidden relative p-2 hover:bg-primary/10 transition-all duration-300 ${
              isMinimized && !isHovered ? 'scale-75' : 'scale-100'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <Menu className={`h-6 w-6 absolute transition-all duration-300 ${
                isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
              }`} />
              <X className={`h-6 w-6 absolute transition-all duration-300 ${
                isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
              }`} />
            </div>
          </Button>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen && !isMinimized ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="mt-4 pb-4 border-t border-border/50">
            <nav className="flex flex-col space-y-2 mt-4">
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 font-medium transition-all duration-300 rounded-lg relative group ${
                    isActive(item.path) 
                      ? 'text-primary bg-primary/10 border-l-4 border-primary' 
                      : 'text-foreground hover:text-primary hover:bg-primary/5 hover:translate-x-2'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300"></div>
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-4 py-3 font-medium transition-all duration-300 rounded-lg flex items-center relative group ${
                    isActive('/admin') 
                      ? 'text-primary bg-primary/10 border-l-4 border-primary' 
                      : 'text-foreground hover:text-primary hover:bg-primary/5 hover:translate-x-2'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  <span className="relative z-10">Admin</span>
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300"></div>
                </Link>
              )}
              
              <div className="border-t border-border/50 pt-4 mt-4 space-y-3">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link
                      to="/dashboard"
                      className={`px-4 py-3 text-sm flex items-center transition-all duration-300 rounded-lg ${
                        isActive('/dashboard') 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">{user?.name} - Dashboard</span>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full justify-center hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <Button 
                    asChild 
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300 flex-1 mr-3 relative overflow-hidden group"
                  >
                    <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="relative z-10">
                      <span>{t('nav.quote')}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </Link>
                  </Button>
                  <LanguageSwitcher />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </header>
  );
};

export default Header;