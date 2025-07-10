import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { 
  Palette, 
  Building, 
  Store, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  Zap,
  Star,
  Eye,
  Lightbulb
} from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Palette,
      title: "Conception & Développement",
      subtitle: "Créativité sur mesure",
      description: "Notre équipe de designers expérimentés transforme vos idées en créations visuelles exceptionnelles, du concept initial à la réalisation finale.",
      features: [
        "Design graphique personnalisé",
        "Prototypage et validation",
        "Développement créatif",
        "Consultation stratégique",
        "Recherche et tendances"
      ],
      highlight: "15+ années d'expertise créative"
    },
    {
      icon: Store,
      title: "Produits PLV Retail",
      subtitle: "Expériences d'achat immersives",
      description: "Solutions complètes pour optimiser vos points de vente avec des présentoirs, displays et mobilier commercial qui captent l'attention et stimulent les ventes.",
      features: [
        "Présentoirs sur mesure",
        "Mobilier retail innovant",
        "Displays interactifs",
        "Solutions modulaires",
        "Aménagement d'espaces"
      ],
      highlight: "500+ projets retail réalisés"
    },
    {
      icon: Sparkles,
      title: "Fournitures Saisonnières",
      subtitle: "Campagnes événementielles",
      description: "Supports promotionnels temporaires et décorations saisonnières qui créent l'événement et marquent les esprits lors de vos campagnes spéciales.",
      features: [
        "Campagnes promotionnelles",
        "Supports temporaires",
        "Décoration saisonnière",
        "Événements spéciaux",
        "Installation express"
      ],
      highlight: "Réactivité 24h/48h"
    },
    {
      icon: Building,
      title: "Habillage & Signalétique",
      subtitle: "Transformation d'espaces",
      description: "Métamorphose complète de vos façades et espaces avec notre expertise en signalétique, enseignes lumineuses et habillage architectural.",
      features: [
        "Habillage façades",
        "Enseignes lumineuses LED",
        "Signalétique directionnelle",
        "Totems et pylônes",
        "Marquage au sol"
      ],
      highlight: "Garantie 5 ans sur nos installations"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-primary-foreground max-w-5xl mx-auto">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-8 text-lg px-8 py-3">
              <Lightbulb className="mr-2 h-5 w-5" />
              Nos Super-pouvoirs
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-tight">
              SERVICES
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                EXTRAORDINAIRES
              </span>
            </h1>
            <p className="text-2xl lg:text-3xl leading-relaxed font-light max-w-4xl mx-auto">
              Chaque service est une nouvelle aventure créative où nous repoussons les limites du possible
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {services.map((service, index) => (
              <Card key={index} className={`group relative overflow-hidden border-0 shadow-glow hover:shadow-pink transition-all duration-700 transform hover:scale-105 ${
                index % 2 === 0 ? 'lg:translate-y-8' : 'lg:-translate-y-8'
              }`}>
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <CardContent className="p-12 relative z-10 bg-white group-hover:bg-transparent transition-colors duration-700">
                  <div className="space-y-8">
                    {/* Icon & Title */}
                    <div className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <div className="text-center">
                        <div className={`w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-glow rotate-12 group-hover:rotate-0 transition-transform duration-700`}>
                          <service.icon className="h-10 w-10 text-white" />
                        </div>
                        <Badge className="bg-accent/10 text-accent group-hover:bg-white/20 group-hover:text-white transition-colors duration-700">
                          {service.subtitle}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={index % 2 === 0 ? 'text-left' : 'text-right'}>
                      <h3 className="text-3xl font-black text-foreground group-hover:text-white mb-6 transition-colors duration-700">
                        {service.title}
                      </h3>
                      <p className="text-lg text-muted-foreground group-hover:text-white/90 mb-8 leading-relaxed transition-colors duration-700">
                        {service.description}
                      </p>
                      
                      {/* Features */}
                      <ul className={`space-y-4 mb-8 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                        {service.features.map((feature, idx) => (
                          <li key={idx} className={`flex items-center text-muted-foreground group-hover:text-white/80 transition-colors duration-700 ${
                            index % 2 === 0 ? 'justify-start' : 'justify-end'
                          }`}>
                            <CheckCircle className={`h-5 w-5 text-success group-hover:text-accent ${index % 2 === 0 ? 'mr-3' : 'ml-3 order-last'} flex-shrink-0`} />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Highlight */}
                      <div className={`inline-flex items-center px-4 py-2 bg-success/10 group-hover:bg-white/10 rounded-full transition-colors duration-700 ${
                        index % 2 === 0 ? '' : 'ml-auto'
                      }`}>
                        <Star className="h-4 w-4 text-success group-hover:text-accent mr-2" />
                        <span className="text-sm font-medium text-success group-hover:text-accent transition-colors duration-700">
                          {service.highlight}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gradient-subtle relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary rounded-full blur-3xl opacity-10 animate-float"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-primary text-primary-foreground mb-8 text-lg px-8 py-3">
              <Eye className="mr-2 h-5 w-5" />
              Notre Processus Créatif
            </Badge>
            <h2 className="text-5xl lg:text-6xl font-black text-foreground mb-8 leading-tight">
              DE L'IDÉE À LA
              <span className="block text-transparent bg-clip-text bg-gradient-primary">RÉALISATION</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Écoute & Analyse", desc: "Compréhension approfondie de vos besoins et objectifs" },
              { step: "02", title: "Conception Créative", desc: "Développement de concepts innovants et sur mesure" },
              { step: "03", title: "Validation & Prototype", desc: "Tests et ajustements pour garantir la perfection" },
              { step: "04", title: "Réalisation & Livraison", desc: "Production et installation avec suivi qualité" }
            ].map((phase, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-medium hover:shadow-glow transition-all duration-500 transform hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl font-black text-primary/20 group-hover:text-primary/40 transition-colors duration-500 mb-4">
                    {phase.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{phase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{phase.desc}</p>
                </CardContent>
              </Card>
            ))}
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
              CRÉONS VOTRE
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                CHEF-D'ŒUVRE
              </span>
            </h2>
            <p className="text-2xl mb-12 text-white/90 leading-relaxed font-light">
              Quel que soit votre défi créatif, nous avons la solution pour le transformer en succès
            </p>
            <div className="flex flex-col lg:flex-row gap-6 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-accent hover:text-white shadow-glow hover:shadow-pink transition-all text-xl px-12 py-6 rounded-2xl transform hover:scale-110"
              >
                <Link to="/contact">
                  <Zap className="mr-3 h-6 w-6" />
                  Discutons de votre projet
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

export default Services;