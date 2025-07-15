import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Rating {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface RatingDisplayProps {
  featured?: boolean;
  limit?: number;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ featured = false, limit }) => {
  const { t } = useLanguage();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [featured]);

  const fetchRatings = async () => {
    try {
      const url = featured 
        ? 'http://localhost:5000/api/ratings?featured=true'
        : 'http://localhost:5000/api/ratings';
      
      const response = await fetch(url);
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const displayedRatings = limit && !showAll ? ratings.slice(0, limit) : ratings;
  const hasMore = limit && ratings.length > limit;

  const isHomepage = featured && limit === 3;

  return (
    <div className={isHomepage ? "grid grid-cols-1 md:grid-cols-3 gap-8" : "space-y-4"}>
      {displayedRatings.map((rating, index) => (
        <Card key={rating.id} className={isHomepage 
          ? `group relative border-0 shadow-glow hover:shadow-pink transition-all duration-500 transform ${
              index === 1 ? 'md:-translate-y-8' : ''
            } hover:scale-105 hover:rotate-2`
          : "hover:shadow-md transition-shadow"
        }>
          {isHomepage && (
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
          )}
          <CardContent className={isHomepage 
            ? "p-10 relative z-10 bg-white group-hover:bg-transparent transition-colors duration-500 rounded-lg"
            : "p-4"
          }>
            {isHomepage && (
              <Quote className="h-12 w-12 text-primary group-hover:text-white mb-6 transition-colors duration-500" />
            )}
            
            {!isHomepage && (
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{rating.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
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
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(rating.created_at).toLocaleDateString()}
                </div>
              </div>
            )}
            
            <p className={isHomepage 
              ? "text-muted-foreground group-hover:text-white/90 mb-8 leading-relaxed text-lg italic transition-colors duration-500"
              : "text-gray-700 text-sm leading-relaxed"
            }>
              {isHomepage ? `"${rating.comment}"` : rating.comment}
            </p>
            
            {isHomepage && (
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
            )}
          </CardContent>
        </Card>
      ))}

      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="gap-2"
          >
            {showAll ? (
              <>
                Voir moins <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                {t('rating.view_all')} ({ratings.length}) <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {ratings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('rating.no_reviews')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RatingDisplay;