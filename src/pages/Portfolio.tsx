import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';
import { useState, useEffect } from 'react';
import { 
  Star, 
  ArrowRight,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import img1 from '@/assets/1.jpg';
import img2 from '@/assets/2.jpg';
import img3 from '@/assets/3.jpg';
import img4 from '@/assets/4.jpg';
import img5 from '@/assets/5.jpg';
import img6 from '@/assets/6.jpg';
import img7 from '@/assets/7.jpg';
import img8 from '@/assets/8.jpg';
import img9 from '@/assets/9.jpg';
import img10 from '@/assets/10.jpg';
import img11 from '@/assets/11.jpg';
import img12 from '@/assets/12.jpg';
import img13 from '@/assets/13.jpg';
import img14 from '@/assets/14.png';
import img15 from '@/assets/15.jpg';
import img16 from '@/assets/16.jpg';

const Portfolio = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const images = [
    img1, img2, img3, img4, img5, img6, img7, img8,
    img9, img10, img11, img12, img13, img14, img15, img16
  ];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={t('portfolio.title1') + ' ' + t('portfolio.title2') + ' - Signa Tech'}
        description={t('portfolio.subtitle')}
        path="/portfolio"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-primary-foreground max-w-5xl mx-auto">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-8 text-lg px-8 py-3">
              <Star className="mr-2 h-5 w-5" />
              {t('portfolio.badge')}
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-tight">
              {t('portfolio.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                {t('portfolio.title2')}
              </span>
            </h1>
            <p className="text-2xl lg:text-3xl leading-relaxed font-light max-w-4xl mx-auto">
              {t('portfolio.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Stacked Image Gallery */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-primary rounded-full blur-3xl opacity-10 animate-float"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-foreground mb-4">Nos Réalisations</h2>
            <p className="text-muted-foreground text-lg">Découvrez notre portfolio de {images.length} projets créatifs</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div 
              className="relative h-[500px] lg:h-[700px] cursor-pointer select-none flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={nextImage}
            >
              {images.map((image, index) => {
                const offset = (index - currentIndex + images.length) % images.length;
                const isVisible = offset < 8;
                const rotation = (Math.random() - 0.5) * 6; // Random rotation between -3 and 3 degrees
                
                return (
                  <div
                    key={index}
                    className={`absolute transition-all duration-500 ease-out ${
                      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    style={{
                      transform: `
                        translateX(${offset * 2}px) 
                        translateY(${-offset * 3}px) 
                        rotate(${offset === 0 ? 0 : rotation}deg)
                        scale(${offset === 0 ? 1 : 0.98})
                      `,
                      zIndex: images.length - offset,
                    }}
                  >
                    <div 
                      className="w-80 h-96 lg:w-[480px] lg:h-[600px] bg-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                      style={{
                        boxShadow: offset === 0 
                          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                          : `0 ${4 + offset * 2}px ${8 + offset * 4}px -${offset}px rgba(0, 0, 0, ${0.1 + offset * 0.05})`
                      }}
                    >
                      <img 
                        src={image} 
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      {offset === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 lg:p-6">
                          <div className="text-white">
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-2 text-xs lg:text-sm">
                              {currentIndex + 1} / {images.length}
                            </Badge>
                            <h3 className="text-sm lg:text-lg font-bold">Réalisation Signa Tech</h3>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center justify-center mt-8 space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevImage}
                className="w-12 h-12 rounded-full border-2 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-primary scale-125' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextImage}
                className="w-12 h-12 rounded-full border-2 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-muted-foreground text-sm">
                Cliquez, glissez ou utilisez les flèches pour naviguer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-primary-foreground max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-6xl font-black mb-8 leading-tight">
              {t('cta.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                {t('cta.title2')}
              </span>
            </h2>
            <p className="text-2xl mb-12 text-white/90 leading-relaxed font-light">
              {t('cta.subtitle')}<span className="font-bold text-accent">{t('cta.subtitle.highlight')}</span> {t('cta.subtitle.end')}
            </p>
            <div className="flex flex-col lg:flex-row gap-6 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-accent hover:text-white shadow-glow hover:shadow-pink transition-all text-xl px-12 py-6 rounded-2xl transform hover:scale-110"
              >
                <Link to="/contact">
                  <Zap className="mr-3 h-6 w-6" />
                  {t('cta.primary')}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;