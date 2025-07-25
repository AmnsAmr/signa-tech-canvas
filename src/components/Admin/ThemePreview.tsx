import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

const ThemePreview = () => {
  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader className="bg-gradient-hero text-white">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Theme Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          {/* Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Buttons</p>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" className="bg-gradient-primary">
                Primary
              </Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Button size="sm" variant="destructive">
                Destructive
              </Button>
            </div>
          </div>
          
          {/* Badges */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Badges</p>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge className="bg-accent">Accent</Badge>
              <Badge className="bg-success">Success</Badge>
              <Badge className="bg-destructive">Error</Badge>
            </div>
          </div>
          
          {/* Text Colors */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Text Colors</p>
            <div className="space-y-1">
              <p className="text-foreground">Primary text (foreground)</p>
              <p className="text-muted-foreground">Muted text</p>
              <p className="text-primary">Primary colored text</p>
              <p className="text-accent">Accent colored text</p>
            </div>
          </div>
          
          {/* Icons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Icons</p>
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <Heart className="h-5 w-5 text-accent fill-accent" />
              <CheckCircle className="h-5 w-5 text-success" />
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Gradient Preview */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Gradient Backgrounds</p>
          <div className="space-y-2">
            <div className="h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-medium">
              Primary Gradient
            </div>
            <div className="h-12 bg-gradient-subtle rounded-lg flex items-center justify-center text-foreground font-medium border">
              Subtle Gradient
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemePreview;