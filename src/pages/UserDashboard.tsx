import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RatingForm from '@/components/RatingSystem/RatingForm';
import { FileText, Star, BarChart3, MessageSquare, Clock, CheckCircle } from 'lucide-react';

interface UserSubmission {
  id: number;
  project: string;
  message: string;
  services: any[];
  status: 'pending' | 'done';
  created_at: string;
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

const UserDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [submissionsRes, ratingsRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/user/submissions', { headers }),
        fetch('http://localhost:5000/api/user/ratings', { headers }),
        fetch('http://localhost:5000/api/user/stats', { headers })
      ]);

      if (submissionsRes.ok) {
        setSubmissions(await submissionsRes.json());
      }
      if (ratingsRes.ok) {
        setRatings(await ratingsRes.json());
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mon Tableau de Bord</h1>
          <p className="text-muted-foreground">Bienvenue, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        {stats && (
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
                <CardTitle className="text-sm font-medium">Avis Donnés</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_ratings}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avis Publiés</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.approved_ratings}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions">Mes Demandes</TabsTrigger>
            <TabsTrigger value="ratings">Mes Avis</TabsTrigger>
            <TabsTrigger value="new-rating">Donner un Avis</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {submission.project || 'Demande de contact'}
                        </h3>
                        <Badge variant={submission.status === 'done' ? 'default' : 'secondary'}>
                          {submission.status === 'done' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Terminé
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-sm">{submission.message}</p>
                    </div>

                    {submission.services && submission.services.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Services demandés:</h4>
                        {submission.services.map((service, index) => (
                          <div key={index} className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                            <div className="font-medium text-sm">{service.serviceType}</div>
                            {service.material && <div className="text-xs text-gray-600">Matériau: {service.material}</div>}
                            {service.size && <div className="text-xs text-gray-600">Taille: {service.size}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                    <p className="text-gray-700">{rating.comment}</p>
                  </CardContent>
                </Card>
              ))}

              {ratings.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun avis donné pour le moment</p>
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
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;