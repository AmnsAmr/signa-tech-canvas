import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Send, Clock, LogIn } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiClient } from '@/api';

const RatingForm: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(false);
  const [canRate, setCanRate] = useState(true);
  const [ratingReason, setRatingReason] = useState('');
  const [checkingEligibility, setCheckingEligibility] = useState(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      checkRatingEligibility();
    }
  }, [isAuthenticated]);

  const checkRatingEligibility = async () => {
    try {
      const response = await apiClient.get('/api/ratings/can-rate');
      
      if (response.success && response.data) {
        const data = response.data as { canRate: boolean; reason: string };
        setCanRate(data.canRate);
        setRatingReason(data.reason);
      }
    } catch (error) {
      console.error('Failed to check rating eligibility:', error);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour donner un avis",
        variant: "destructive"
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une note",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await apiClient.post('/api/ratings/submit', { rating, comment });

      if (response.success) {
        toast({
          title: "Merci!",
          description: (response.data as { message: string }).message
        });
        
        setRating(0);
        setComment('');
        checkRatingEligibility();
      } else {
        toast({
          title: "Erreur",
          description: response.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: t('rating.send_error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingEligibility) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('rating.checking')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('rating.give_review')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <LogIn className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="font-semibold mb-2">{t('rating.login_required')}</h3>
          <p className="text-gray-600">
            {t('rating.login_required_desc')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!canRate) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('rating.customer_review')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {ratingReason === 'already_rated' && (
            <>
              <Star className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="font-semibold mb-2">{t('rating.thank_you')}</h3>
              <p className="text-gray-600">{t('rating.already_rated')}</p>
            </>
          )}
          {ratingReason === 'no_completed_submission' && (
            <>
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-semibold mb-2">{t('rating.not_eligible')}</h3>
              <p className="text-gray-600">{t('rating.eligibility_desc')}</p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('rating.give_review')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('rating.rating_label')} *</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('rating.comment_label')} *</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('rating.comment_placeholder')}
              rows={4}
              minLength={10}
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 {t('rating.characters')} ({t('rating.minimum')} 10)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || rating === 0 || comment.length < 10}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? t('rating.sending') : t('rating.send_review')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RatingForm;