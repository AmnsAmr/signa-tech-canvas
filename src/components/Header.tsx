import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, Mail, User, LogOut, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import AuthModal from './Auth/AuthModal';
import Logo from '@/assets/Logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.projects'), path: '/portfolio' },
    { name: t('nav.contact'), path: '/contact' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      {/* Top contact bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>+212 6 23 53 74 45</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>contact@signatech.ma</span>
            </div>
          </div>
          <div className="hidden md:block text-xs">
            {t('company.address')}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={Logo} 
              alt="Signa Tech Logo" 
              className="h-12 w-auto object-contain transition-all hover:scale-105"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors hover:text-primary ${
                  isActive(item.path) 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`font-medium transition-colors hover:text-primary flex items-center ${
                  isActive('/admin') 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-foreground'
                }`}
              >
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </Link>
            )}
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`text-sm flex items-center transition-colors hover:text-primary ${
                    isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <User className="h-4 w-4 mr-1" />
                  {user?.name}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center"
              >
                <User className="h-4 w-4 mr-1" />
                Login
              </Button>
            )}
            <Button asChild className="bg-gradient-moroccan shadow-medium hover:shadow-strong transition-all">
              <Link to="/contact">{t('nav.quote')}</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col space-y-4 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-medium transition-colors ${
                    isActive(item.path) ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`font-medium transition-colors flex items-center ${
                    isActive('/admin') ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className={`text-sm flex items-center transition-colors ${
                      isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-1" />
                    {user?.name} - Dashboard
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-fit"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
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
                  className="flex items-center w-fit"
                >
                  <User className="h-4 w-4 mr-1" />
                  Login
                </Button>
              )}
              <div className="flex items-center justify-between">
                <Button asChild className="bg-gradient-moroccan shadow-medium w-fit">
                  <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                    {t('nav.quote')}
                  </Link>
                </Button>
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </header>
  );
};

export default Header;