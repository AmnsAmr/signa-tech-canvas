import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {displayedRatings.map((rating) => (
        <Card key={rating.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
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
            <p className="text-gray-700 text-sm leading-relaxed">
              {rating.comment}
            </p>
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
                Voir tous les avis ({ratings.length}) <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {ratings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun avis pour le moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RatingDisplay;