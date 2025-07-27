import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface Rating {
  id: number;
  user_id?: number;
  name: string;
  email?: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

const AdminRatings: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/ratings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRatingStatus = async (id: number, is_approved: boolean, is_featured: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/ratings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_approved, is_featured })
      });

      if (response.ok) {
        setRatings(prev => prev.map(rating => 
          rating.id === id ? { ...rating, is_approved, is_featured } : rating
        ));
        toast({
          title: t('rating.status_updated'),
          description: t('rating.status_updated_desc')
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('rating.update_error'),
        variant: "destructive"
      });
    }
  };

  const deleteRating = async (id: number) => {
    if (!confirm(t('rating.delete_confirm'))) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/ratings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setRatings(prev => prev.filter(rating => rating.id !== id));
        toast({
          title: t('rating.deleted'),
          description: t('rating.deleted_desc')
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('rating.delete_error'),
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          {t('rating.manage_reviews')} ({ratings.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ratings.map((rating) => (
            <Card key={rating.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{rating.name}</h4>
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
                        {rating.is_approved ? t('rating.approved') : t('rating.pending')}
                      </Badge>
                      {rating.is_featured && (
                        <Badge variant="outline">{t('rating.featured')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rating.email}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={rating.is_approved ? "outline" : "default"}
                      onClick={() => updateRatingStatus(rating.id, !rating.is_approved, rating.is_featured)}
                    >
                      {rating.is_approved ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          {t('rating.hide')}
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          {t('rating.approve')}
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant={rating.is_featured ? "default" : "outline"}
                      onClick={() => updateRatingStatus(rating.id, rating.is_approved, !rating.is_featured)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {rating.is_featured ? t('rating.remove') : t('rating.feature')}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteRating(rating.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>{rating.comment}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {ratings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('rating.no_reviews')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRatings;