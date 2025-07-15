import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RatingStats from '@/components/RatingSystem/RatingStats';
import RatingDisplay from '@/components/RatingSystem/RatingDisplay';
import RatingForm from '@/components/RatingSystem/RatingForm';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const Ratings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('rating.customer_reviews')}
          </h1>
          <p className="text-xl text-muted-foreground">
            Découvrez ce que nos clients pensent de nos services
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Rating Stats */}
          <div className="lg:col-span-1">
            <RatingStats />
          </div>
          
          {/* Rating Form */}
          <div className="lg:col-span-2">
            <RatingForm />
          </div>
        </div>

        {/* All Ratings */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {t('rating.all_reviews')}
          </h2>
          <RatingDisplay />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Ratings;