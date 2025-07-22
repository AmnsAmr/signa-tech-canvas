import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Debug: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [apiStatus, setApiStatus] = useState<string>(t('debug.status_not_checked'));
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkApi = async () => {
    try {
      setApiStatus(t('debug.checking'));
      setError(null);
      
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      
      const data = await response.json();
      setApiResponse(data);
      setApiStatus(response.ok ? t('debug.success') : `${t('debug.error')}: ${response.status}`);
    } catch (err) {
      setApiStatus(t('debug.failed'));
      setError(err instanceof Error ? err.message : t('debug.unknown_error'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-6">{t('debug.page_title')}</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('debug.auth_status')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>{t('debug.loading')}:</strong> {authLoading ? t('debug.yes') : t('debug.no')}</p>
              <p><strong>{t('debug.authenticated')}:</strong> {isAuthenticated ? t('debug.yes') : t('debug.no')}</p>
              <p><strong>{t('debug.user')}:</strong> {user ? JSON.stringify(user) : t('debug.not_logged_in')}</p>
              <p><strong>{t('debug.token')}:</strong> {localStorage.getItem('token') ? t('debug.present') : t('debug.not_found')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('debug.api_test')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>{t('debug.status')}:</strong> {apiStatus}</p>
              {error && <p className="text-red-500"><strong>{t('debug.error')}:</strong> {error}</p>}
              {apiResponse && (
                <div className="mt-4">
                  <p><strong>{t('debug.response')}:</strong></p>
                  <pre className="bg-muted p-4 rounded overflow-auto max-h-[200px]">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
              <Button onClick={checkApi} className="mt-4">{t('debug.test_api_connection')}</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('debug.environment')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>{t('debug.api_url')}:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:5000'}</p>
              <p><strong>{t('debug.mode')}:</strong> {import.meta.env.MODE}</p>
              <p><strong>{t('debug.browser')}:</strong> {navigator.userAgent}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Debug;