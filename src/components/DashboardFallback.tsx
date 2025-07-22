import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle } from 'lucide-react';

const DashboardFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" />
              Problème de chargement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              Nous rencontrons un problème pour charger votre tableau de bord. 
              Cela peut être dû à un problème de connexion ou à une erreur temporaire.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => window.location.reload()}>
                Rafraîchir la page
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Retour à l'accueil
              </Button>
              <Button variant="link" onClick={() => window.location.href = '/debug'}>
                Page de diagnostic
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardFallback;