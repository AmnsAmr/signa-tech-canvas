import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getCsrfToken, makeAuthenticatedRequest } from '@/utils/csrf';

const AuthDebug = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');

  const runDebugTests = async () => {
    const info: any = {
      user,
      isAdmin,
      isAuthenticated,
      token: localStorage.getItem('token'),
      timestamp: new Date().toISOString()
    };

    try {
      // Test CSRF token
      const csrfToken = await getCsrfToken();
      info.csrfToken = csrfToken.substring(0, 20) + '...';

      // Test theme endpoint
      const response = await makeAuthenticatedRequest('/api/admin/theme', {
        method: 'POST',
        body: JSON.stringify({
          primary: '270 85% 60%',
          accent: '320 85% 65%'
        })
      });

      info.themeTestStatus = response.status;
      info.themeTestOk = response.ok;

      if (!response.ok) {
        const errorText = await response.text();
        info.themeTestError = errorText;
      } else {
        const result = await response.json();
        info.themeTestResult = result;
      }

    } catch (error) {
      info.error = error.message;
    }

    setDebugInfo(info);
    setTestResult(JSON.stringify(info, null, 2));
  };

  const testDirectFetch = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get CSRF token
      const csrfResponse = await fetch('/api/csrf-token', {
        credentials: 'include'
      });
      const { csrfToken } = await csrfResponse.json();

      // Test theme update
      const response = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          primary: '270 85% 60%',
          accent: '320 85% 65%'
        })
      });

      const result = {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: response.ok ? await response.json() : await response.text()
      };

      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Auth Debug - Not Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User: {user?.email || 'Not logged in'}</p>
          <p>Role: {user?.role || 'None'}</p>
          <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={runDebugTests}>Run Debug Tests</Button>
          <Button onClick={testDirectFetch} variant="outline">Test Direct Fetch</Button>
        </div>
        
        {testResult && (
          <div>
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {testResult}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebug;