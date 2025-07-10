import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Zap,
  Heart
} from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
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
              <Heart className="mr-2 h-5 w-5" />
              Parlons Création
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-tight">
              CONNECTONS
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                NOS ÉNERGIES
              </span>
            </h1>
            <p className="text-2xl lg:text-3xl leading-relaxed font-light">
              Prêt à transformer vos idées en réalité visuelle ? Contactez-nous !
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <Card className="group relative overflow-hidden border-0 shadow-glow hover:shadow-pink transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-12 relative z-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-foreground mb-4">
                    Démarrons Votre Projet
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Partagez-nous votre vision et nous la transformerons en chef-d'œuvre visuel.
                  </p>
                </div>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nom complet *
                      </label>
                      <Input 
                        placeholder="Votre nom"
                        className="border-border/50 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Entreprise
                      </label>
                      <Input 
                        placeholder="Nom de votre entreprise"
                        className="border-border/50 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <Input 
                        type="email"
                        placeholder="votre@email.com"
                        className="border-border/50 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Téléphone
                      </label>
                      <Input 
                        placeholder="+212 X XX XX XX XX"
                        className="border-border/50 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Type de projet
                    </label>
                    <select className="w-full p-3 border border-border/50 rounded-lg focus:border-primary transition-colors bg-background">
                      <option>Sélectionnez votre besoin</option>
                      <option>Conception & Développement</option>
                      <option>Produits PLV Retail</option>
                      <option>Fournitures Saisonnières</option>
                      <option>Habillage & Signalétique</option>
                      <option>Autre projet créatif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Décrivez votre vision *
                    </label>
                    <Textarea 
                      placeholder="Partagez-nous votre idée, vos objectifs, votre budget approximatif..."
                      rows={5}
                      className="border-border/50 focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-pink transition-all text-lg py-6 transform hover:scale-105"
                  >
                    <Send className="mr-3 h-5 w-5" />
                    Envoyer ma demande
                    <Zap className="ml-3 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Contact Cards */}
              <div className="space-y-6">
                <Card className="group relative overflow-hidden border-0 shadow-medium hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-glow transition-all">
                        <Phone className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Téléphone</h3>
                        <p className="text-muted-foreground mb-2">Appellez-nous directement</p>
                        <a 
                          href="tel:+212539403133" 
                          className="text-primary hover:text-accent font-medium transition-colors"
                        >
                          +212 5 39 40 31 33
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 shadow-medium hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-glow transition-all">
                        <Mail className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Email</h3>
                        <p className="text-muted-foreground mb-2">Écrivez-nous</p>
                        <a 
                          href="mailto:contact@signatech.ma" 
                          className="text-primary hover:text-accent font-medium transition-colors"
                        >
                          contact@signatech.ma
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 shadow-medium hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-glow transition-all">
                        <MapPin className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Adresse</h3>
                        <p className="text-muted-foreground mb-2">Visitez notre atelier</p>
                        <p className="text-foreground">
                          Zone Industrielle Gzenaya<br />
                          Lot 376, Tanger<br />
                          Maroc
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 shadow-medium hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-glow transition-all">
                        <Clock className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Horaires</h3>
                        <p className="text-muted-foreground mb-2">Nos heures d'ouverture</p>
                        <div className="text-foreground text-sm space-y-1">
                          <p>Lun - Ven: 8h00 - 18h00</p>
                          <p>Samedi: 8h00 - 13h00</p>
                          <p>Dimanche: Fermé</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* WhatsApp Button */}
              <Button 
                asChild
                size="lg" 
                className="w-full bg-green-500 hover:bg-green-600 text-white shadow-glow hover:shadow-strong transition-all text-lg py-6 transform hover:scale-105"
              >
                <a 
                  href="https://wa.me/212539403133"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-3 h-6 w-6" />
                  Chatter sur WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Trouvez-nous</h2>
            <p className="text-muted-foreground">Zone Industrielle Gzenaya, Tanger</p>
          </div>
          
          <Card className="overflow-hidden border-0 shadow-strong">
            <div className="aspect-[16/10] bg-muted flex items-center justify-center">
              {/* Placeholder for Google Maps */}
              <div className="text-center">
                <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Carte Google Maps à intégrer<br />
                  Zone Industrielle Gzenaya, Lot 376, Tanger
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;