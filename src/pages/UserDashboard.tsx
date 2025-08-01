import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RatingForm from '@/components/RatingSystem/RatingForm';
import { useToast } from '@/hooks/use-toast';
import { FileText, Star, BarChart3, MessageSquare, Clock, CheckCircle, Download, Paperclip } from 'lucide-react';
import FileContextMenu from '@/components/FileContextMenu';
import { ProjectCard } from '@/components/shared';
import AccountSettings from '@/components/User/AccountSettings';

interface UserSubmission {
  id: number;
  project: string;
  message: string;
  services: any[];
  status: 'pending' | 'done';
  created_at: string;
  has_file?: boolean;
  file_info?: {
    name: string;
    size: number;
    type: string;
    path: string;
  } | null;
}

interface UserRating {
  id: number;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

interface UserStats {
  total_submissions: number;
  total_ratings: number;
  completed_submissions: number;
  approved_ratings: number;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const UserDashboard: React.FC = () => {
  // Debug logging
  useLayoutEffect(() => {
    console.log('UserDashboard mounting');
    return () => console.log('UserDashboard unmounting');
  }, []);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [stats, setStats] = useState<UserStats | null>({
    total_submissions: 0,
    total_ratings: 0,
    completed_submissions: 0,
    approved_ratings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('UserDashboard effect running', { isAuthenticated, authLoading });
    if (isAuthenticated) {
      fetchUserData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log('Fetching user data...');
      
      // Use the proxy configured in vite.config.ts
      // Fetch each endpoint separately to better handle errors
      try {
        const submissionsRes = await fetch('/api/user/submissions', { headers });
        console.log('Submissions response:', submissionsRes.status);
        if (submissionsRes.ok) {
          const data = await submissionsRes.json();
          setSubmissions(data);
        }
      } catch (e) {
        console.error('Failed to fetch submissions:', e);
      }
      
      try {
        const ratingsRes = await fetch('/api/user/ratings', { headers });
        console.log('Ratings response:', ratingsRes.status);
        if (ratingsRes.ok) {
          const data = await ratingsRes.json();
          setRatings(data);
        }
      } catch (e) {
        console.error('Failed to fetch ratings:', e);
      }
      
      try {
        const statsRes = await fetch('/api/user/stats', { headers });
        console.log('Stats response:', statsRes.status);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      }
      
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de charger vos données. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      // Always set loading to false, even if there are errors
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Accès Refusé</h1>
          <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mon Tableau de Bord</h1>
          <p className="text-muted-foreground">Bienvenue, {user?.name || 'Utilisateur'}</p>
          {loading && (
            <div className="text-sm text-blue-500 flex items-center gap-2 mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              Chargement des données...
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Demandes Total</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_submissions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Terminées</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed_submissions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('rating.reviews')} Donnés</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_ratings}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('rating.reviews')} Publiés</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.approved_ratings}</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chargement...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions">Mes Demandes</TabsTrigger>
            <TabsTrigger value="ratings">Mes {t('rating.reviews')}</TabsTrigger>
            <TabsTrigger value="new-rating">{t('rating.give_review')}</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <div className="space-y-4">
              {submissions.map((submission) => (
                <ProjectCard
                  key={submission.id}
                  id={submission.id}
                  name={submission.project || 'Demande de contact'}
                  message={submission.message}
                  status={submission.status}
                  createdAt={submission.created_at}
                  hasFile={submission.has_file}
                  fileInfo={submission.file_info}
                  services={Array.isArray(submission.services) ? submission.services : []}
                  isExpanded={false}
                />
              ))}


              {submissions.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune demande pour le moment</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ratings">
            <div className="space-y-4">
              {ratings.map((rating) => (
                <Card key={rating.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= rating.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant={rating.is_approved ? 'default' : 'secondary'}>
                          {rating.is_approved ? 'Publié' : 'En attente'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{rating.comment}</p>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (confirm(t('rating.delete_confirm'))) {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch('/api/ratings/my-rating', {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            
                            if (response.ok) {
                              fetchUserData(); // Refresh data
                              toast({
                                title: t('rating.deleted'),
                                description: t('rating.deleted_desc')
                              });
                            }
                          } catch (error) {
                            toast({
                              title: "Erreur",
                              description: t('rating.delete_error'),
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                    >
                      Supprimer mon {t('rating.reviews')}
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {ratings.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun {t('rating.reviews')} donné pour le moment</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="new-rating">
            <div className="flex justify-center">
              <RatingForm />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;