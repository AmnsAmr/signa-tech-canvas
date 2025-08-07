import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

interface ThemePreviewProps {
  previewColors: any;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ previewColors }) => {
  const gradientStyle = {
    background: `linear-gradient(${previewColors.gradientDirection || '135deg'}, hsl(${previewColors.gradientStart || previewColors.primary}), hsl(${previewColors.gradientEnd || previewColors.accent}))`
  };
  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader style={gradientStyle} className="text-white">
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
              <Button size="sm" style={gradientStyle} className="text-white">
                Primary
              </Button>
              <Button size="sm" variant="outline" style={{ borderColor: `hsl(${previewColors.border})`, color: `hsl(${previewColors.foreground})` }}>
                Outline
              </Button>
              <Button size="sm" style={{ backgroundColor: `hsl(${previewColors.secondary})`, color: `hsl(${previewColors.foreground})` }}>
                Secondary
              </Button>
              <Button size="sm" style={{ backgroundColor: `hsl(${previewColors.destructive})`, color: 'white' }}>
                Destructive
              </Button>
            </div>
          </div>
          
          {/* Badges */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Badges</p>
            <div className="flex gap-2 flex-wrap">
              <Badge style={{ backgroundColor: `hsl(${previewColors.primary})`, color: 'white' }}>Primary</Badge>
              <Badge style={{ backgroundColor: `hsl(${previewColors.secondary})`, color: `hsl(${previewColors.foreground})` }}>Secondary</Badge>
              <Badge style={{ backgroundColor: `hsl(${previewColors.accent})`, color: 'white' }}>Accent</Badge>
              <Badge style={{ backgroundColor: `hsl(${previewColors.success})`, color: 'white' }}>Success</Badge>
              <Badge style={{ backgroundColor: `hsl(${previewColors.destructive})`, color: 'white' }}>Error</Badge>
            </div>
          </div>
          
          {/* Text Colors */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Text Colors</p>
            <div className="space-y-1">
              <p style={{ color: `hsl(${previewColors.foreground})` }}>Primary text (foreground)</p>
              <p style={{ color: `hsl(${previewColors.muted})` }}>Muted text</p>
              <p style={{ color: `hsl(${previewColors.primary})` }}>Primary colored text</p>
              <p style={{ color: `hsl(${previewColors.accent})` }}>Accent colored text</p>
            </div>
          </div>
          
          {/* Icons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Icons</p>
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5" style={{ color: `hsl(${previewColors.primary})`, fill: `hsl(${previewColors.primary})` }} />
              <Heart className="h-5 w-5" style={{ color: `hsl(${previewColors.accent})`, fill: `hsl(${previewColors.accent})` }} />
              <CheckCircle className="h-5 w-5" style={{ color: `hsl(${previewColors.success})` }} />
              <AlertTriangle className="h-5 w-5" style={{ color: `hsl(${previewColors.destructive})` }} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Gradient Preview */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Gradient Backgrounds</p>
          <div className="space-y-2">
            <div className="h-12 rounded-lg flex items-center justify-center text-white font-medium" style={gradientStyle}>
              Primary Gradient
            </div>
            <div className="h-12 rounded-lg flex items-center justify-center font-medium border" 
                 style={{ 
                   background: `linear-gradient(${previewColors.gradientDirection || '135deg'}, hsl(${previewColors.gradientStart || previewColors.primary} / 0.05), hsl(${previewColors.gradientEnd || previewColors.accent} / 0.05))`,
                   color: `hsl(${previewColors.foreground})`,
                   borderColor: `hsl(${previewColors.border})`
                 }}>
              Subtle Gradient
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemePreview;