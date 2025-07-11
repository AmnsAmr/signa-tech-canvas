import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  onClose?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

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
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} onSuccess={onClose} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} onSuccess={onClose} />
      )}
    </div>
  );
};

export default AuthModal;