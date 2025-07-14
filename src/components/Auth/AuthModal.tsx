import React, { useState } from 'react';
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4 relative">
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10"
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
  );
};

export default AuthModal;