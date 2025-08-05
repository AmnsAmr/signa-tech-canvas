import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, Shield } from 'lucide-react';
import { apiClient } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  role: 'admin' | 'client';
  created_at: string;
}

const UserManager: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiClient.buildUrl('/api/admin/users'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const deleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}'s account? This action is irreversible.`)) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiClient.buildUrl(`/api/admin/users/${userId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert(t('user_manager.user_deleted'));
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(`${t('common.error')}: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(t('user_manager.delete_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          {t('user_manager.title')}
        </h2>
        <Badge variant="secondary">{users.length} {t('user_manager.users')}</Badge>
      </div>

      <div className="grid gap-4">
        {users.map((userData) => (
          <Card key={userData.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{userData.name}</h3>
                    <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'}>
                      {userData.role === 'admin' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          {t('user_manager.admin')}
                        </>
                      ) : (
                        t('user_manager.client')
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{userData.email}</p>
                  {userData.company && (
                    <p className="text-sm text-muted-foreground mb-1">{userData.company}</p>
                  )}
                  {userData.phone && (
                    <p className="text-sm text-muted-foreground mb-1">{userData.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('user_manager.registered_on')} {new Date(userData.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {userData.id !==Number( user?.id) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(userData.id, userData.name)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('user_manager.delete')}
                    </Button>
                  )}
                  {userData.id ===Number (user?.id) && (
                    <Badge variant="outline">{t('user_manager.your_account')}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('user_manager.no_users')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManager;
