import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthApi } from '@/api';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const { t } = useLanguage();
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
      const response = await AuthApi.forgotPassword(email);
      
      if (!response.success) {
        throw new Error(response.error || t('auth.forgot_password.server_unavailable'));
      }

      setSuccess(response.data.message);
      setStep('code');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError(t('auth.forgot_password.connection_error'));
      } else {
        setError(err.message || t('auth.forgot_password.unknown_error'));
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
      const response = await AuthApi.verifyResetCode(email, code);
      
      if (!response.success) {
        throw new Error(response.error || t('auth.forgot_password.server_error'));
      }
      setStep('password');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError(t('auth.forgot_password.connection_error'));
      } else {
        setError(err.message || t('auth.forgot_password.unknown_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('auth.forgot_password.passwords_no_match'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await AuthApi.resetPassword(email, code, password);
      
      if (!response.success) {
        throw new Error(response.error || t('auth.forgot_password.server_error'));
      }

      setSuccess(response.data.message);
      setTimeout(() => onBackToLogin(), 2000);
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError(t('auth.forgot_password.connection_error'));
      } else {
        setError(err.message || t('auth.forgot_password.unknown_error'));
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
            {step === 'email' && t('auth.forgot_password.email_title')}
            {step === 'code' && t('auth.forgot_password.verification_title')}
            {step === 'password' && t('auth.forgot_password.new_password_title')}
          </h2>
          <p className="text-muted-foreground">
            {step === 'email' && t('auth.forgot_password.email_desc')}
            {step === 'code' && t('auth.forgot_password.code_desc')}
            {step === 'password' && t('auth.forgot_password.password_desc')}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.forgot_password.email_label')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.forgot_password.email_placeholder')}
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
              {loading ? t('auth.forgot_password.sending') : t('auth.forgot_password.send_code')}
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.forgot_password.code_label')}
              </label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('auth.forgot_password.code_placeholder')}
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
              {loading ? t('auth.forgot_password.verifying') : t('auth.forgot_password.verify_code')}
            </Button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.forgot_password.password_label')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.forgot_password.password_placeholder')}
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.forgot_password.confirm_password_label')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.forgot_password.confirm_password_placeholder')}
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
              {loading ? t('auth.forgot_password.updating') : t('auth.forgot_password.reset_password')}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-primary hover:underline font-medium flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('auth.forgot_password.back_to_login')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordForm;