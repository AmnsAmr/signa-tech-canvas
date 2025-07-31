import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useLanguage , yearsOfExperience} from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';
import { 
  ArrowRight, 
  Award, 
  Users, 
  Clock, 
  Palette, 
  Building, 
  Store, 
  Sparkles,
  CheckCircle,
  Star,
  Quote,
  Zap,
  Play,
  TrendingUp,
  Lightbulb,
  Phone
} from 'lucide-react';
import HomepageTestimonials from '@/components/RatingSystem/HomepageTestimonials';
import { useImageCache } from '@/hooks/useImageCache';
import usePreloadCriticalImages from '@/hooks/usePreloadCriticalImages';
import ImageLoader from '@/components/ImageLoader';
import { useEffect } from 'react';

const Index = () => {
  const { t } = useLanguage();
  const { images: heroImages } = useImageCache('hero');
  const { images: aboutImages } = useImageCache('about');
  
  // Sort hero images by ID to ensure consistent order
  const sortedHeroImages = [...heroImages].sort((a, b) => a.id - b.id);
  
  // Use the sorted hero images for the three cards
  const heroImage = sortedHeroImages[0]; // Main hero image
  const facadeImage = sortedHeroImages[1]; // Facade project image (2nd hero image)
  const plvImage = sortedHeroImages[2]; // PLV project image (3rd hero image)
  
  // Preload critical images for better LCP
  usePreloadCriticalImages(
    [heroImage?.filename, facadeImage?.filename].filter(Boolean),
    { fetchPriority: 'high' }
  );
  
  // Log available images for debugging
  useEffect(() => {
    console.log('Hero images available:', heroImages.length);
    console.log('About images available:', aboutImages.length);
    
    // Log the specific images being used
    console.log('Hero image 1 (main):', heroImage?.filename);
    console.log('Hero image 2 (facade):', facadeImage?.filename);
    console.log('Hero image 3 (plv/craft):', plvImage?.filename);
  }, [heroImages, aboutImages, heroImage, facadeImage, plvImage]);
  
  const services = [
    {
      icon: Palette,
      title: t('services.design.title'),
      description: t('services.design.desc'),
      features: [t('services.design.feature1'), t('services.design.feature2'), t('services.design.feature3')]
    },
    {
      icon: Store,
      title: t('services.retail.title'),
      description: t('services.retail.desc'),
      features: [t('services.retail.feature1'), t('services.retail.feature2'), t('services.retail.feature3')]
    },
    {
      icon: Sparkles,
      title: t('services.seasonal.title'),
      description: t('services.seasonal.desc'),
      features: [t('services.seasonal.feature1'), t('services.seasonal.feature2'), t('services.seasonal.feature3')]
    },
    {
      icon: Building,
      title: t('services.signage.title'),
      description: t('services.signage.desc'),
      features: [t('services.signage.feature1'), t('services.signage.feature2'), t('services.signage.feature3')]
    }
  ];

  // Testimonials are now loaded dynamically from the database

  const stats = [
    { number: yearsOfExperience, label: t('stats.experience'), icon: Clock },
    { number: "500+", label: t('stats.projects'), icon: Award },
    { number: "200+", label: t('stats.clients'), icon: Users },
    { number: "100%", label: t('stats.solutions'), icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead />
      <Header />
      
      {/* Hero Section - Optimized Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Simplified Gradient Background */}
        <div className="absolute inset-0 bg-gradient-hero"></div>
        
        {/* Simplified Background Elements - Hidden on mobile */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/10 rounded-3xl rotate-45"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-5xl mx-auto text-center text-primary-foreground">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-8 animate-fade-in text-lg px-6 py-2">
              <Sparkles className="mr-2 h-5 w-5" />
              {t('hero.badge')}
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 lg:mb-8 leading-tight px-4 will-change-transform">
              {t('hero.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                {t('hero.title2')}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl mb-8 lg:mb-12 text-white/90 leading-relaxed max-w-4xl mx-auto font-light px-4">
              {t('hero.subtitle')} 
              <span className="font-bold text-accent"> {t('hero.subtitle.highlight')}</span> {t('hero.subtitle.end')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center px-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-accent hover:text-white shadow-medium transition-all duration-200 text-lg lg:text-xl px-8 lg:px-12 py-4 lg:py-6 rounded-2xl touch-manipulation w-full sm:w-auto"
              >
                <Link to="/contact">
                  <Zap className="mr-2 lg:mr-3 h-5 lg:h-6 w-5 lg:w-6" />
                  {t('hero.cta.primary')}
                  <ArrowRight className="ml-2 lg:ml-3 h-5 lg:h-6 w-5 lg:w-6" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-white/50 text-white hover:bg-white hover:text-primary backdrop-blur-sm text-lg lg:text-xl px-8 lg:px-12 py-4 lg:py-6 rounded-2xl transition-all duration-200 touch-manipulation w-full sm:w-auto"
              >
                <Link to="/portfolio">
                  <Play className="mr-2 lg:mr-3 h-5 lg:h-6 w-5 lg:w-6" />
                  {t('hero.cta.secondary')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Creative Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-background">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section - Optimized Design */}
      <section className="py-16 lg:py-24 relative">
        <div className="absolute inset-0 bg-gradient-subtle"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-4 lg:mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto shadow-medium transition-all duration-200 touch-manipulation">
                    <stat.icon className="h-8 w-8 lg:h-10 lg:w-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 w-4 h-4 lg:w-6 lg:h-6 bg-accent rounded-full opacity-80"></div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary mb-2 lg:mb-3 transition-colors duration-200">{stat.number}</div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium px-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Optimized Layout */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary rounded-full blur-3xl opacity-5 hidden lg:block"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-primary text-primary-foreground mb-8 text-lg px-8 py-3 rounded-full shadow-glow">
              <Lightbulb className="mr-2 h-5 w-5" />
              {t('services.badge')}
            </Badge>
            <h2 className="text-5xl lg:text-7xl font-black text-foreground mb-8 leading-tight">
              {t('services.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-primary">{t('services.title2')}</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-medium hover:shadow-strong transition-all duration-300 touch-manipulation">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 lg:p-8 relative z-10 bg-white group-hover:bg-transparent transition-colors duration-300">
                  <div className="flex flex-col space-y-4 lg:space-y-6">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-medium self-start">
                      <service.icon className="h-7 w-7 lg:h-8 lg:w-8 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl lg:text-2xl font-bold text-foreground group-hover:text-white mb-3 transition-colors duration-300">{service.title}</h3>
                      <p className="text-base lg:text-lg text-muted-foreground group-hover:text-white/90 mb-4 leading-relaxed transition-colors duration-300">{service.description}</p>
                      <ul className="space-y-2 text-left">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm lg:text-base text-muted-foreground group-hover:text-white/80 transition-colors duration-300">
                            <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-success group-hover:text-accent mr-2 lg:mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16 lg:mt-20">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong transition-all duration-200 text-lg lg:text-xl px-12 lg:px-16 py-4 lg:py-6 rounded-2xl">
              <Link to="/services">
                <TrendingUp className="mr-3 h-5 w-5 lg:h-6 lg:w-6" />
                {t('services.cta')}
                <ArrowRight className="ml-3 h-5 w-5 lg:h-6 lg:w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Portfolio Preview - Optimized Gallery */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-primary rounded-full blur-3xl opacity-10 hidden lg:block"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-primary text-primary-foreground mb-8 text-lg px-8 py-3 rounded-full shadow-glow">
              <Star className="mr-2 h-5 w-5" />
              {t('portfolio.badge')}
            </Badge>
            <h2 className="text-5xl lg:text-7xl font-black text-foreground mb-8 leading-tight">
              {t('portfolio.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-primary">{t('portfolio.title2')}</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t('portfolio.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="group relative overflow-hidden border-0 shadow-medium hover:shadow-strong transition-all duration-300 touch-manipulation">
              <div className="aspect-square overflow-hidden relative">
                <ImageLoader
                  filename={facadeImage?.filename}
                  alt="Habillage façade"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  priority={true}
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-70 transition-opacity duration-300 flex items-center justify-center">
                  <Play className="h-12 w-12 lg:h-16 lg:w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <CardContent className="p-6 lg:p-8 bg-white group-hover:bg-gradient-primary transition-colors duration-300">
                <h3 className="text-lg lg:text-xl font-bold text-foreground group-hover:text-white mb-3 transition-colors duration-300">{t('portfolio.facade.title')}</h3>
                <p className="text-sm lg:text-base text-muted-foreground group-hover:text-white/90 transition-colors duration-300">{t('portfolio.facade.desc')}</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-medium hover:shadow-strong transition-all duration-300 lg:translate-y-4">
              <div className="aspect-square overflow-hidden relative">
                <ImageLoader
                  filename={heroImage?.filename}
                  alt="Displays PLV"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-70 transition-opacity duration-300 flex items-center justify-center">
                  <Play className="h-12 w-12 lg:h-16 lg:w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <CardContent className="p-6 lg:p-8 bg-white group-hover:bg-gradient-primary transition-colors duration-300">
                <h3 className="text-lg lg:text-xl font-bold text-foreground group-hover:text-white mb-3 transition-colors duration-300">{t('portfolio.plv.title')}</h3>
                <p className="text-sm lg:text-base text-muted-foreground group-hover:text-white/90 transition-colors duration-300">{t('portfolio.plv.desc')}</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-medium hover:shadow-strong transition-all duration-300">
              <div className="aspect-square overflow-hidden relative">
                <ImageLoader
                  filename={plvImage?.filename}
                  alt="Artisanat"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-70 transition-opacity duration-300 flex items-center justify-center">
                  <Play className="h-12 w-12 lg:h-16 lg:w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <CardContent className="p-6 lg:p-8 bg-white group-hover:bg-gradient-primary transition-colors duration-300">
                <h3 className="text-lg lg:text-xl font-bold text-foreground group-hover:text-white mb-3 transition-colors duration-300">{t('portfolio.craft.title')}</h3>
                <p className="text-sm lg:text-base text-muted-foreground group-hover:text-white/90 transition-colors duration-300">{t('portfolio.craft.desc')}</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-16 lg:mt-20">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong transition-all duration-200 text-lg lg:text-xl px-12 lg:px-16 py-4 lg:py-6 rounded-2xl">
              <Link to="/portfolio">
                <Sparkles className="mr-3 h-5 w-5 lg:h-6 lg:w-6" />
                {t('portfolio.cta')}
                <ArrowRight className="ml-3 h-5 w-5 lg:h-6 lg:w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials - Optimized Cards */}
      <section className="py-16 lg:py-24 relative overflow-hidden bg-gradient-subtle">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-primary rounded-full blur-3xl opacity-10 hidden lg:block"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-primary text-primary-foreground mb-8 text-lg px-8 py-3 rounded-full shadow-glow">
              <Users className="mr-2 h-5 w-5" />
              {t('testimonials.badge')}
            </Badge>
            <h2 className="text-5xl lg:text-7xl font-black text-foreground mb-8 leading-tight">
              {t('testimonials.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-primary">{t('testimonials.title2')}</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t('testimonials.subtitle')}
            </p>
          </div>

          {/* Dynamic Ratings Display - Top 3 by Rating */}
          <HomepageTestimonials />
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="text-xl px-12 py-4 rounded-2xl">
              <Link to="/ratings">
                <Star className="mr-3 h-6 w-6" />
                {t('rating.view_all')}
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section - Optimized */}
      <section className="py-20 lg:py-32 bg-gradient-hero relative overflow-hidden">
        {/* Simplified Background Elements */}
        <div className="absolute inset-0 hidden lg:block">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-primary-foreground max-w-5xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 lg:mb-8 leading-tight">
              {t('cta.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-light to-white">
                {t('cta.title2')}
              </span>
              <span className="block text-2xl lg:text-4xl font-light mt-4">{t('cta.title3')}</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl mb-12 lg:mb-16 text-white/90 max-w-4xl mx-auto leading-relaxed font-light px-4">
              {t('cta.subtitle')}<span className="font-bold text-accent">{t('cta.subtitle.highlight')}</span> {t('cta.subtitle.end')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 justify-center items-center px-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-accent hover:text-white shadow-medium hover:shadow-strong transition-all duration-200 text-lg lg:text-xl px-12 lg:px-16 py-4 lg:py-6 rounded-2xl w-full sm:w-auto"
              >
                <Link to="/contact">
                  <Zap className="mr-3 lg:mr-4 h-5 lg:h-6 w-5 lg:w-6" />
                  {t('cta.primary')}
                  <ArrowRight className="ml-3 lg:ml-4 h-5 lg:h-6 w-5 lg:w-6" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-white/50 text-white hover:bg-white hover:text-primary backdrop-blur-sm text-lg lg:text-xl px-12 lg:px-16 py-4 lg:py-6 rounded-2xl transition-all duration-200 w-full sm:w-auto"
              >
                <a href="tel:+212539403133">
                  <Phone className="mr-3 lg:mr-4 h-5 lg:h-6 w-5 lg:w-6" />
                  {t('cta.secondary')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
