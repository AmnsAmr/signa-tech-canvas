import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Trash2, Eye, EyeOff } from 'lucide-react';
import { buildApiUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password && user?.password && !user?.oauth_provider) {
      alert('Veuillez entrer votre mot de passe pour confirmer');
      return;
    }

    if (!confirm('Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données.')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/auth/account'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        alert('Votre compte a été supprimé avec succès');
        logout();
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Erreur lors de la suppression du compte');
    } finally {
      setLoading(false);
    }
  };

  const requiresPassword = user?.password && !user?.oauth_provider;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Informations du Compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nom</label>
            <p className="text-sm">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm">{user?.email}</p>
          </div>
          {user?.company && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Entreprise</label>
              <p className="text-sm">{user.company}</p>
            </div>
          )}
          {user?.phone && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
              <p className="text-sm">{user.phone}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Type de compte</label>
            <p className="text-sm">{user?.oauth_provider ? 'Google' : 'Email/Mot de passe'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-xl text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zone Dangereuse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Supprimer le compte</h3>
            <p className="text-sm text-red-700 mb-4">
              Cette action supprimera définitivement votre compte et toutes les données associées. 
              Cette action ne peut pas être annulée.
            </p>
            
            {!showDeleteForm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteForm(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer mon compte
              </Button>
            ) : (
              <div className="space-y-4">
                {requiresPassword && (
                  <div>
                    <label className="text-sm font-medium text-red-800">
                      Confirmez avec votre mot de passe
                    </label>
                    <div className="relative mt-1">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={loading || (requiresPassword && !password)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {loading ? 'Suppression...' : 'Confirmer la suppression'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteForm(false);
                      setPassword('');
                    }}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;