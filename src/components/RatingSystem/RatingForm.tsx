import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const RatingForm: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState(isAuthenticated ? user?.name || '' : '');
  const [email, setEmail] = useState(isAuthenticated ? user?.email || '' : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une note",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = isAuthenticated ? '/api/ratings/submit' : '/api/ratings/guest-submit';
      const token = localStorage.getItem('token');
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const body: any = { rating, comment };
      if (!isAuthenticated) {
        body.name = name;
        body.email = email;
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Merci!",
          description: result.message
        });
        
        setRating(0);
        setComment('');
        if (!isAuthenticated) {
          setName('');
          setEmail('');
        }
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre avis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Donnez votre avis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isAuthenticated && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email (optionnel)</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Note *</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Commentaire *</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={4}
              minLength={10}
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caractères (minimum 10)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || rating === 0 || comment.length < 10}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Envoi...' : 'Envoyer mon avis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RatingForm;