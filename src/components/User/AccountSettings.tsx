import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Trash2, Eye, EyeOff, User, Lock, Save } from 'lucide-react';
import { buildApiUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AccountSettings: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Profile update states
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Delete account states
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }

    setProfileLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          ...(newPassword && { currentPassword, newPassword })
        })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès"
        });
        
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Refresh user data
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du profil",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword && user?.password && !user?.oauth_provider) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre mot de passe pour confirmer",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/auth/account'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Votre compte a été supprimé avec succès"
        });
        logout();
        navigate('/');
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du compte",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const requiresPassword = user?.password && !user?.oauth_provider;
  const hasChanges = name !== user?.name || newPassword;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            Modifier le Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nom</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <Input
              value={user?.email || ''}
              disabled
              className="mt-1 bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">L'email ne peut pas être modifié</p>
          </div>
          
          {user?.company && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Entreprise</label>
              <Input
                value={user.company}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
          )}
          
          {user?.phone && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
              <Input
                value={user.phone}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Type de compte</label>
            <p className="text-sm mt-1">{user?.oauth_provider ? 'Google' : 'Email/Mot de passe'}</p>
          </div>
          
          <Button
            onClick={handleUpdateProfile}
            disabled={profileLoading || !hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {profileLoading ? 'Mise à jour...' : 'Sauvegarder'}
          </Button>
        </CardContent>
      </Card>

      {!user?.oauth_provider && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Changer le Mot de Passe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Mot de passe actuel</label>
              <div className="relative mt-1">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nouveau mot de passe</label>
              <div className="relative mt-1">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez votre nouveau mot de passe"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Confirmer le nouveau mot de passe</label>
              <div className="relative mt-1">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                        type={showDeletePassword ? 'text' : 'password'}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Entrez votre mot de passe"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                      >
                        {showDeletePassword ? (
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
                    disabled={deleteLoading || (requiresPassword && !deletePassword)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteLoading ? 'Suppression...' : 'Confirmer la suppression'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteForm(false);
                      setDeletePassword('');
                    }}
                    disabled={deleteLoading}
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