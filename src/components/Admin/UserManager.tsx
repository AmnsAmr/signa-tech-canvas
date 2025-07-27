import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, Shield } from 'lucide-react';
import { buildApiUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/admin/users'), {
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
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${userName} ? Cette action est irréversible.`)) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/admin/users/${userId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Utilisateur supprimé avec succès');
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Gestion des Utilisateurs
        </h2>
        <Badge variant="secondary">{users.length} utilisateurs</Badge>
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
                          Admin
                        </>
                      ) : (
                        'Client'
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
                    Inscrit le {new Date(userData.created_at).toLocaleDateString()}
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
                      Supprimer
                    </Button>
                  )}
                  {userData.id ===Number (user?.id) && (
                    <Badge variant="outline">Votre compte</Badge>
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
              <p>Aucun utilisateur trouvé</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManager;