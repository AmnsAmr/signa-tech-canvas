import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
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
import heroImage from '@/assets/hero-workshop.jpg';
import facadeImage from '@/assets/facade-project.jpg';
import plvImage from '@/assets/plv-displays.jpg';
import teamImage from '@/assets/team-work.jpg';

const Index = () => {
  const { t } = useLanguage();
  
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
    { number: "15+", label: t('stats.experience'), icon: Clock },
    { number: "500+", label: t('stats.projects'), icon: Award },
    { number: "200+", label: t('stats.clients'), icon: Users },
    { number: "100%", label: t('stats.solutions'), icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead />
      <Header />
      
      {/* Hero Section - Bold Creative Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Gradient Background */}
        <div className="absolute inset-0 bg-gradient-hero animate-gradient-shift bg-[size:400%_400%]"></div>
        
        {/* Floating Creative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/20 rounded-3xl rotate-45 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-10 w-24 h-24 bg-white/5 rounded-full animate-creative-spin"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-5xl mx-auto text-center text-primary-foreground">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-8 animate-fade-in text-lg px-6 py-2">
              <Sparkles className="mr-2 h-5 w-5" />
              {t('hero.badge')}
            </Badge>
            
            <h1 className="text-6xl lg:text-8xl font-black mb-8 animate-fade-in leading-tight">
              {t('hero.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                {t('hero.title2')}
              </span>
            </h1>
            
            <p className="text-2xl lg:text-3xl mb-12 text-white/90 animate-slide-in-right leading-relaxed max-w-4xl mx-auto font-light">
              {t('hero.subtitle')} 
              <span className="font-bold text-accent"> {t('hero.subtitle.highlight')}</span> {t('hero.subtitle.end')}
            </p>
            
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center animate-fade-in">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-accent hover:text-white shadow-strong hover:shadow-glow transition-all text-xl px-12 py-6 rounded-2xl transform hover:scale-105"
              >
                <Link to="/contact">
                  <Zap className="mr-3 h-6 w-6" />
                  {t('hero.cta.primary')}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-white/50 text-white hover:bg-white hover:text-primary backdrop-blur-sm text-xl px-12 py-6 rounded-2xl transform hover:scale-105"
              >
                <Link to="/portfolio">
                  <Play className="mr-3 h-6 w-6" />
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

      {/* Stats Section - Creative Design */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-subtle"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group animate-fade-in">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto shadow-glow group-hover:shadow-pink transition-all duration-300 group-hover:scale-110 rotate-3 group-hover:rotate-6">
                    <stat.icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-glow-pulse"></div>
                </div>
                <div className="text-4xl lg:text-5xl font-black text-primary mb-3 group-hover:text-accent transition-colors">{stat.number}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Asymmetric Creative Layout */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary rounded-full blur-3xl opacity-10 animate-float"></div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <Card key={index} className={`group relative overflow-hidden border-0 shadow-strong hover:shadow-glow transition-all duration-500 transform hover:-translate-y-2 ${
                index % 2 === 0 ? 'lg:translate-y-8' : 'lg:-translate-y-8'
              }`}>
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="p-10 relative z-10 bg-white group-hover:bg-transparent transition-colors duration-500">
                  <div className="flex flex-col space-y-6">
                    <div className={`w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow rotate-12 group-hover:rotate-0 transition-transform duration-500 ${
                      index % 2 === 0 ? 'self-start' : 'self-end'
                    }`}>
                      <service.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className={index % 2 === 0 ? 'text-left' : 'text-right'}>
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-white mb-4 transition-colors duration-500">{service.title}</h3>
                      <p className="text-muted-foreground group-hover:text-white/90 mb-6 leading-relaxed text-lg transition-colors duration-500">{service.description}</p>
                      <ul className={`space-y-3 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                        {service.features.map((feature, idx) => (
                          <li key={idx} className={`flex items-center text-muted-foreground group-hover:text-white/80 transition-colors duration-500 ${
                            index % 2 === 0 ? 'justify-start' : 'justify-end'
                          }`}>
                            <CheckCircle className={`h-5 w-5 text-success group-hover:text-accent ${index % 2 === 0 ? 'mr-3' : 'ml-3 order-last'} flex-shrink-0`} />
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

          <div className="text-center mt-20">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-pink transition-all text-xl px-16 py-6 rounded-2xl transform hover:scale-110">
              <Link to="/services">
                <TrendingUp className="mr-3 h-6 w-6" />
                {t('services.cta')}
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Portfolio Preview - Creative Gallery */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group relative overflow-hidden border-0 shadow-glow hover:shadow-pink transition-all duration-500 transform hover:-rotate-1 hover:scale-105">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={facadeImage} 
                  alt="Habillage façade" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-80 transition-opacity duration-500 flex items-center justify-center">
                  <Play className="h-16 w-16 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                </div>
              </div>
              <CardContent className="p-8 bg-white group-hover:bg-gradient-primary transition-colors duration-500">
                <h3 className="text-xl font-bold text-foreground group-hover:text-white mb-3 transition-colors duration-500">{t('portfolio.facade.title')}</h3>
                <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-500">{t('portfolio.facade.desc')}</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-glow hover:shadow-pink transition-all duration-500 transform hover:rotate-1 hover:scale-105 lg:translate-y-8">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={plvImage} 
                  alt="Displays PLV" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-80 transition-opacity duration-500 flex items-center justify-center">
                  <Play className="h-16 w-16 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                </div>
              </div>
              <CardContent className="p-8 bg-white group-hover:bg-gradient-primary transition-colors duration-500">
                <h3 className="text-xl font-bold text-foreground group-hover:text-white mb-3 transition-colors duration-500">{t('portfolio.plv.title')}</h3>
                <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-500">{t('portfolio.plv.desc')}</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-glow hover:shadow-pink transition-all duration-500 transform hover:-rotate-1 hover:scale-105">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={teamImage} 
                  alt="Équipe travail" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-80 transition-opacity duration-500 flex items-center justify-center">
                  <Play className="h-16 w-16 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                </div>
              </div>
              <CardContent className="p-8 bg-white group-hover:bg-gradient-primary transition-colors duration-500">
                <h3 className="text-xl font-bold text-foreground group-hover:text-white mb-3 transition-colors duration-500">{t('portfolio.craft.title')}</h3>
                <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-500">{t('portfolio.craft.desc')}</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-20">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-pink transition-all text-xl px-16 py-6 rounded-2xl transform hover:scale-110">
              <Link to="/portfolio">
                <Sparkles className="mr-3 h-6 w-6" />
                {t('portfolio.cta')}
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials - Creative Floating Cards */}
      <section className="py-24 relative overflow-hidden bg-gradient-subtle">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-float"></div>
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
                Voir tous les avis
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section - Bold & Creative */}
      <section className="py-32 bg-gradient-hero relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-0 w-32 h-96 bg-white/5 rounded-full rotate-45 blur-2xl animate-creative-spin"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-primary-foreground max-w-5xl mx-auto">
            <h2 className="text-6xl lg:text-8xl font-black mb-8 leading-tight">
              {t('cta.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-light to-white">
                {t('cta.title2')}
              </span>
              <span className="block text-4xl lg:text-5xl font-light mt-4">{t('cta.title3')}</span>
            </h2>
            <p className="text-2xl lg:text-3xl mb-16 text-white/90 max-w-4xl mx-auto leading-relaxed font-light">
              {t('cta.subtitle')}<span className="font-bold text-accent">{t('cta.subtitle.highlight')}</span> {t('cta.subtitle.end')}
            </p>
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-accent hover:text-white shadow-glow hover:shadow-pink transition-all text-2xl px-16 py-8 rounded-3xl transform hover:scale-110 animate-glow-pulse"
              >
                <Link to="/contact">
                  <Zap className="mr-4 h-8 w-8" />
                  {t('cta.primary')}
                  <ArrowRight className="ml-4 h-8 w-8" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-white/50 text-white hover:bg-white hover:text-primary backdrop-blur-sm text-2xl px-16 py-8 rounded-3xl transform hover:scale-110"
              >
                <a href="tel:+212539403133">
                  <Phone className="mr-4 h-8 w-8" />
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
