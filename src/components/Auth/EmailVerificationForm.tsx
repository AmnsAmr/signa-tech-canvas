import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Shield, RotateCcw } from 'lucide-react';
import { secureApiRequest, handleCSRFError } from '@/utils/csrf';

interface EmailVerificationFormProps {
  email: string;
  userData: any;
  onSuccess: (token: string, user: any) => void;
  onBack: () => void;
}

const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({
  email,
  userData,
  onSuccess,
  onBack
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await secureApiRequest('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, userData })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.token, data.user);
      } else {
        if (handleCSRFError(data)) {
          // Retry once with new CSRF token
          const retryResponse = await secureApiRequest('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, userData })
          });
          
          const retryData = await retryResponse.json();
          
          if (retryResponse.ok) {
            onSuccess(retryData.token, retryData.user);
          } else {
            setError(retryData.message || 'Code invalide');
          }
        } else {
          setError(data.message || 'Code invalide');
        }
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await secureApiRequest('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60);
        setCode('');
      } else {
        if (handleCSRFError(data)) {
          // Retry once with new CSRF token
          const retryResponse = await secureApiRequest('/api/auth/resend-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          
          const retryData = await retryResponse.json();
          
          if (retryResponse.ok) {
            setCountdown(60);
            setCode('');
          } else {
            setError(retryData.message || 'Erreur lors du renvoi');
          }
        } else {
          setError(data.message || 'Erreur lors du renvoi');
        }
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Vérifiez votre email</h2>
          <p className="text-muted-foreground">
            Nous avons envoyé un code à 6 chiffres à
          </p>
          <p className="font-medium text-foreground">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Code de vérification
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="pl-10 text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Vérification...' : 'Vérifier le code'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Vous n'avez pas reçu le code ?
          </p>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={resendLoading || countdown > 0}
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {countdown > 0 
              ? `Renvoyer dans ${countdown}s` 
              : resendLoading 
                ? 'Envoi...' 
                : 'Renvoyer le code'
            }
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            Retour à l'inscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerificationForm;