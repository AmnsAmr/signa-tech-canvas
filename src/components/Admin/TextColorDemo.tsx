import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Type } from 'lucide-react';

interface TextColorDemoProps {
  previewColors: any;
}

const TextColorDemo: React.FC<TextColorDemoProps> = ({ previewColors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Text Color Types Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Primary Text</p>
              <p className="font-medium" style={{ color: `hsl(${previewColors.textPrimary || previewColors.foreground})` }}>This is primary text content</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Secondary Text</p>
              <p style={{ color: `hsl(${previewColors.textSecondary || '260 15% 35%'})` }}>This is secondary text content</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Muted Text</p>
              <p style={{ color: `hsl(${previewColors.textMuted || previewColors.muted})` }}>This is muted text content</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Accent Text</p>
              <p className="font-medium" style={{ color: `hsl(${previewColors.textAccent || previewColors.accent})` }}>This is accent text content</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Success Text</p>
              <p className="font-medium" style={{ color: `hsl(${previewColors.textSuccess || previewColors.success})` }}>Operation completed successfully</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Warning Text</p>
              <p className="font-medium" style={{ color: `hsl(${previewColors.textWarning || '45 95% 50%'})` }}>Please review this content</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Error Text</p>
              <p className="font-medium" style={{ color: `hsl(${previewColors.textError || previewColors.destructive})` }}>An error has occurred</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Link Text</p>
              <p className="font-medium hover:underline cursor-pointer" style={{ color: `hsl(${previewColors.textLink || previewColors.primary})` }}>This is a clickable link</p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Mixed Content Example:</p>
          <div className="space-y-2">
            <p style={{ color: `hsl(${previewColors.textPrimary || previewColors.foreground})` }}>
              Welcome to our platform! <span className="font-medium" style={{ color: `hsl(${previewColors.textAccent || previewColors.accent})` }}>Signa Tech</span> provides 
              <span className="hover:underline cursor-pointer" style={{ color: `hsl(${previewColors.textLink || previewColors.primary})` }}> innovative solutions</span> for your business needs.
            </p>
            <p style={{ color: `hsl(${previewColors.textSecondary || '260 15% 35%'})` }}>
              <span style={{ color: `hsl(${previewColors.textSuccess || previewColors.success})` }}>✓ Verified</span> | 
              <span style={{ color: `hsl(${previewColors.textWarning || '45 95% 50%'})` }}> ⚠ Review required</span> | 
              <span style={{ color: `hsl(${previewColors.textError || previewColors.destructive})` }}> ✗ Action needed</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextColorDemo;