import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthModalProps {
  onClose?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {view === 'login' && (
          <LoginForm 
            onSwitchToRegister={() => setView('register')} 
            onSwitchToForgotPassword={() => setView('forgot')}
            onSuccess={onClose} 
          />
        )}
        {view === 'register' && (
          <RegisterForm onSwitchToLogin={() => setView('login')} onSuccess={onClose} />
        )}
        {view === 'forgot' && (
          <ForgotPasswordForm onBackToLogin={() => setView('login')} />
        )}
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;