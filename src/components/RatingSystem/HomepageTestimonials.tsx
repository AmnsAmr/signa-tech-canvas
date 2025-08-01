import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RatingsApi } from '@/api';

interface Rating {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const HomepageTestimonials: React.FC = () => {
  const { t } = useLanguage();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await RatingsApi.getAll();
      if (response.success && response.data) {
        // Get top 3 ratings
        setRatings(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="group relative border-0 shadow-glow">
            <CardContent className="p-10">
              <div className="animate-pulse space-y-4">
                <div className="h-12 w-12 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-xl text-muted-foreground">{t('rating.no_reviews')}</p>
        <p className="text-muted-foreground mt-2">Soyez le premier à partager votre expérience!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {ratings.map((rating, index) => (
        <Card key={rating.id} className={`group relative border-0 shadow-glow hover:shadow-pink transition-all duration-500 transform ${
          index === 1 ? 'md:-translate-y-8' : ''
        } hover:scale-105 hover:rotate-2`}>
          <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
          <CardContent className="p-10 relative z-10 bg-white group-hover:bg-transparent transition-colors duration-500 rounded-lg">
            <Quote className="h-12 w-12 text-primary group-hover:text-white mb-6 transition-colors duration-500" />
            <p className="text-muted-foreground group-hover:text-white/90 mb-8 leading-relaxed text-lg italic transition-colors duration-500">
              "{rating.comment}"
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground group-hover:text-white text-lg transition-colors duration-500">{rating.name}</div>
                <div className="text-muted-foreground group-hover:text-white/80 transition-colors duration-500">Client SignaTech</div>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-5 w-5 ${
                    star <= rating.rating
                      ? 'fill-accent text-accent group-hover:fill-white group-hover:text-white'
                      : 'text-gray-300 group-hover:text-white/30'
                  } transition-colors duration-500`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HomepageTestimonials;