import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';
import SEOHead from '@/components/SEOHead';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead 
        title="Mot de passe oublié - SignaTech"
        description="Réinitialisez votre mot de passe SignaTech"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gradient-subtle py-12">
          <ForgotPasswordForm onBackToLogin={() => navigate('/contact')} />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ForgotPassword;