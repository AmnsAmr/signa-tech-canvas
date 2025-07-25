import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Zap } from 'lucide-react';

const ThemePreview = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Theme Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" className="bg-gradient-primary">
            Primary Button
          </Button>
          <Button size="sm" variant="outline">
            Outline
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Badge className="bg-primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge className="bg-accent">Accent</Badge>
        </div>
        
        <div className="p-4 bg-card border rounded-lg">
          <p className="text-foreground mb-2">Sample text in foreground color</p>
          <p className="text-muted-foreground text-sm">Muted text example</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary fill-primary" />
          <Heart className="h-4 w-4 text-accent fill-accent" />
          <span className="text-sm">Icons with theme colors</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemePreview;