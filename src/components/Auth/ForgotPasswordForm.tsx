import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message);
        } else {
          throw new Error('Serveur indisponible. Vérifiez que le serveur est démarré.');
        }
      }

      const data = await response.json();
      setSuccess(data.message);
      setStep('code');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.');
      } else {
        setError(err.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message);
        } else {
          throw new Error('Serveur indisponible');
        }
      }

      const data = await response.json();
      setStep('password');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Impossible de se connecter au serveur');
      } else {
        setError(err.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message);
        } else {
          throw new Error('Serveur indisponible');
        }
      }

      const data = await response.json();
      setSuccess(data.message);
      setTimeout(() => onBackToLogin(), 2000);
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Impossible de se connecter au serveur');
      } else {
        setError(err.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {step === 'email' && 'Mot de passe oublié'}
            {step === 'code' && 'Vérification'}
            {step === 'password' && 'Nouveau mot de passe'}
          </h2>
          <p className="text-muted-foreground">
            {step === 'email' && 'Entrez votre email pour recevoir un code de vérification'}
            {step === 'code' && 'Entrez le code à 6 chiffres envoyé à votre email'}
            {step === 'password' && 'Créez votre nouveau mot de passe'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-500 text-sm text-center">{success}</div>}

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Envoi...' : 'Envoyer le code'}
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Code de vérification
              </label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </Button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && (
              <div className="text-green-500 text-sm text-center flex items-center justify-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-primary hover:underline font-medium flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordForm;