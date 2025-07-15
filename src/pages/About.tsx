import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Shield, 
  Lightbulb,
  Award,
  Heart,
  Zap,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';
import { useImageCache } from '@/hooks/useImageCache';
import ImageLoader from '@/components/ImageLoader';

const About = () => {
  const { t } = useLanguage();
  const { images: heroImages } = useImageCache('hero');
  const { images: aboutImages } = useImageCache('about');
  
  const teamImage = aboutImages[0] || heroImages[0];
  
  const values = [
    {
      icon: Award,
      title: t('about.values.quality.title'),
      description: t('about.values.quality.desc'),
      color: "from-primary to-accent"
    },
    {
      icon: Shield,
      title: t('about.values.confidentiality.title'), 
      description: t('about.values.confidentiality.desc'),
      color: "from-accent to-primary"
    },
    {
      icon: Lightbulb,
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.desc'),
      color: "from-primary to-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={t('about.hero.title1') + ' ' + t('about.hero.title2') + ' - Signa Tech'}
        description={t('about.hero.subtitle')}
        path="/about"
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
          <div className="text-center text-primary-foreground max-w-4xl mx-auto">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-8 text-lg px-8 py-3">
              <Users className="mr-2 h-5 w-5" />
              {t('about.hero.badge')}
            </Badge>
            <h1 className="text-6xl lg:text-7xl font-black mb-8 leading-tight">
              {t('about.hero.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                {t('about.hero.title2')}
              </span>
            </h1>
            <p className="text-2xl lg:text-3xl leading-relaxed font-light">
              {t('about.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-gradient-primary text-primary-foreground mb-8 text-lg px-6 py-2">
                {t('about.story.badge')}
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-8 leading-tight">
                {t('about.story.title')}
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  {t('about.story.p1')}
                </p>
                <p>
                  {t('about.story.p2')}
                </p>
                <p>
                  {t('about.story.p3')}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl transform rotate-6 opacity-20"></div>
              <ImageLoader
                filename={teamImage?.filename}
                alt="Équipe Signa Tech au travail"
                className="relative z-10 w-full rounded-3xl shadow-strong transform -rotate-2 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-primary text-primary-foreground mb-8 text-lg px-8 py-3">
              <Heart className="mr-2 h-5 w-5" />
              {t('about.values.badge')}
            </Badge>
            <h2 className="text-5xl lg:text-6xl font-black text-foreground mb-8 leading-tight">
              {t('about.values.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-primary">{t('about.values.title2')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className={`group relative overflow-hidden border-0 shadow-glow hover:shadow-pink transition-all duration-500 transform hover:scale-105 ${
                index === 1 ? 'md:-translate-y-8' : ''
              }`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <CardContent className="p-10 relative z-10 bg-white group-hover:bg-transparent transition-colors duration-500">
                  <div className="text-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow transform rotate-12 group-hover:rotate-0 transition-transform duration-500`}>
                      <value.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-white mb-4 transition-colors duration-500">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground group-hover:text-white/90 leading-relaxed transition-colors duration-500">
                      {value.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <Card className="group relative overflow-hidden border-0 shadow-glow hover:shadow-pink transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-12 relative z-10 bg-white group-hover:bg-transparent transition-colors duration-500">
                <div className="flex items-center mb-8">
                  <Target className="h-12 w-12 text-primary group-hover:text-white mr-4 transition-colors duration-500" />
                  <h3 className="text-3xl font-bold text-foreground group-hover:text-white transition-colors duration-500">
                    {t('about.mission.title')}
                  </h3>
                </div>
                <p className="text-lg text-muted-foreground group-hover:text-white/90 leading-relaxed transition-colors duration-500">
                  {t('about.mission.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-glow hover:shadow-pink transition-all duration-500 lg:translate-y-8">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-12 relative z-10 bg-white group-hover:bg-transparent transition-colors duration-500">
                <div className="flex items-center mb-8">
                  <Eye className="h-12 w-12 text-primary group-hover:text-white mr-4 transition-colors duration-500" />
                  <h3 className="text-3xl font-bold text-foreground group-hover:text-white transition-colors duration-500">
                    {t('about.vision.title')}
                  </h3>
                </div>
                <p className="text-lg text-muted-foreground group-hover:text-white/90 leading-relaxed transition-colors duration-500">
                  {t('about.vision.desc')}
                </p>
              </CardContent>
            </Card>
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
              {t('about.cta.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                {t('about.cta.title2')}
              </span>
            </h2>
            <p className="text-2xl mb-12 text-white/90 leading-relaxed font-light">
              {t('about.cta.subtitle')}
            </p>
            <div className="flex flex-col lg:flex-row gap-6 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-accent hover:text-white shadow-glow hover:shadow-pink transition-all text-xl px-12 py-6 rounded-2xl transform hover:scale-110"
              >
                <Link to="/contact">
                  <Zap className="mr-3 h-6 w-6" />
                  {t('about.cta.button')}
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

export default About;