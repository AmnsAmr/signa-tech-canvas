import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
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
  Quote
} from 'lucide-react';
import heroImage from '@/assets/hero-workshop.jpg';
import facadeImage from '@/assets/facade-project.jpg';
import plvImage from '@/assets/plv-displays.jpg';
import teamImage from '@/assets/team-work.jpg';

const Index = () => {
  const services = [
    {
      icon: Palette,
      title: "Conception & Développement",
      description: "Création sur mesure de vos supports de communication et PLV avec notre équipe de designers expérimentés.",
      features: ["Design personnalisé", "Prototypage", "Validation client"]
    },
    {
      icon: Store,
      title: "Produits PLV Retail",
      description: "Solutions complètes pour vos points de vente : présentoirs, displays, mobilier commercial.",
      features: ["Présentoirs sur mesure", "Mobilier retail", "Displays interactifs"]
    },
    {
      icon: Sparkles,
      title: "Fournitures Saisonnières",
      description: "Campagnes promotionnelles et supports temporaires pour vos événements spéciaux.",
      features: ["Campagnes événementielles", "Supports temporaires", "Décoration saisonnière"]
    },
    {
      icon: Building,
      title: "Habillage & Signalétique",
      description: "Transformation complète de vos façades et espaces avec notre expertise en signalétique.",
      features: ["Habillage façades", "Enseignes lumineuses", "Signalétique directionnelle"]
    }
  ];

  const testimonials = [
    {
      name: "Coca-Cola Bottling",
      role: "Responsable Marketing",
      content: "Signa Tech a transformé nos points de vente avec des solutions PLV exceptionnelles. Leur créativité et professionnalisme sont remarquables.",
      rating: 5
    },
    {
      name: "Juver",
      role: "Directeur Commercial",
      content: "Un partenaire de confiance depuis plusieurs années. La qualité de leurs réalisations et le respect des délais sont exemplaires.",
      rating: 5
    },
    {
      name: "Expleo Group",
      role: "Chef de Projet",
      content: "L'expertise technique et l'innovation de Signa Tech ont considérablement amélioré notre visibilité commerciale.",
      rating: 5
    }
  ];

  const stats = [
    { number: "15+", label: "Années d'expérience", icon: Clock },
    { number: "500+", label: "Projets réalisés", icon: Award },
    { number: "200+", label: "Clients satisfaits", icon: Users },
    { number: "100%", label: "Solutions sur mesure", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Atelier Signa Tech" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-primary-foreground">
            <Badge className="bg-accent text-accent-foreground mb-6 animate-fade-in">
              15+ années d'expertise au Maroc
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 animate-fade-in leading-tight">
              Solutions Créatives de
              <span className="text-accent block">Communication</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-primary-foreground/90 animate-slide-in-right leading-relaxed">
              Des solutions PLV innovantes et une signalétique d'excellence 
              qui renforcent la visibilité de votre marque à Tanger et dans tout le Maroc.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Button 
                asChild 
                size="lg" 
                className="bg-accent text-accent-foreground hover:bg-accent-dark shadow-strong hover:shadow-glow transition-all text-lg px-8 py-4"
              >
                <Link to="/contact">
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-4"
              >
                <Link to="/portfolio">Voir nos réalisations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium">
                  <stat.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary-light text-primary mb-6">Nos Expertises</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Services & Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              De la conception à la réalisation, nous vous accompagnons dans tous vos projets 
              de communication visuelle et PLV.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-strong transition-all duration-300 bg-gradient-card border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-glow transition-all">
                      <service.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
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

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-moroccan shadow-medium hover:shadow-strong">
              <Link to="/services">
                Découvrir tous nos services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-20 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-accent-light text-accent-dark mb-6">Nos Réalisations</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Projets qui Inspirent
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez quelques-unes de nos réalisations les plus remarquables, 
              témoins de notre savoir-faire et de notre créativité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-strong transition-all duration-300 overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={facadeImage} 
                  alt="Habillage façade" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Habillage Façade Commercial</h3>
                <p className="text-muted-foreground text-sm">Transformation complète d'une façade commerciale avec signalétique moderne et éclairage LED.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-strong transition-all duration-300 overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={plvImage} 
                  alt="Displays PLV" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Solutions PLV Retail</h3>
                <p className="text-muted-foreground text-sm">Présentoirs et displays innovants pour optimiser l'expérience client en point de vente.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-strong transition-all duration-300 overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={teamImage} 
                  alt="Équipe travail" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Conception Sur Mesure</h3>
                <p className="text-muted-foreground text-sm">Notre équipe d'experts conçoit et développe des solutions personnalisées pour chaque client.</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/portfolio">
                Voir tous nos projets
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-success/10 text-success mb-6">Témoignages</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              La Confiance de nos Clients
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Plus de 200 clients nous font confiance pour leurs projets de communication visuelle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-medium transition-all">
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-primary mb-4" />
                  <p className="text-muted-foreground mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-repeat bg-center" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30l15-15v30l-15-15zm0 0l-15 15V15l15 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-primary-foreground">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Prêt à Transformer Votre
              <span className="text-accent block">Communication Visuelle ?</span>
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Obtenez un devis personnalisé et gratuit pour vos projets PLV et signalétique. 
              Notre équipe vous conseille et vous accompagne à chaque étape.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-accent text-accent-foreground hover:bg-accent-dark shadow-strong hover:shadow-glow text-lg px-8 py-4"
              >
                <Link to="/contact">
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-4"
              >
                <a href="tel:+212539403133">Appeler maintenant</a>
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
