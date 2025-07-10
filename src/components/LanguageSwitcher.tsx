import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <div className="flex bg-muted rounded-lg p-1">
        <Button
          variant={language === 'fr' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('fr')}
          className={`px-3 py-1 text-xs font-medium transition-all ${
            language === 'fr' 
              ? 'bg-gradient-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          FR
        </Button>
        <Button
          variant={language === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-xs font-medium transition-all ${
            language === 'en' 
              ? 'bg-gradient-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          EN
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;