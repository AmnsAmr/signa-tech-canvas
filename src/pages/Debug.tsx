import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Debug: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [apiStatus, setApiStatus] = useState<string>('Not checked');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkApi = async () => {
    try {
      setApiStatus('Checking...');
      setError(null);
      
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      
      const data = await response.json();
      setApiResponse(data);
      setApiStatus(response.ok ? 'Success' : `Error: ${response.status}`);
    } catch (err) {
      setApiStatus('Failed');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-6">Debug Page</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? JSON.stringify(user) : 'Not logged in'}</p>
              <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Not found'}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Status:</strong> {apiStatus}</p>
              {error && <p className="text-red-500"><strong>Error:</strong> {error}</p>}
              {apiResponse && (
                <div className="mt-4">
                  <p><strong>Response:</strong></p>
                  <pre className="bg-muted p-4 rounded overflow-auto max-h-[200px]">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
              <Button onClick={checkApi} className="mt-4">Test API Connection</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:5000'}</p>
              <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
              <p><strong>Browser:</strong> {navigator.userAgent}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Debug;