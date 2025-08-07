import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Type } from 'lucide-react';

const TextColorDemo = () => {
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
              <p className="text-text-primary font-medium">This is primary text content</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Secondary Text</p>
              <p className="text-text-secondary">This is secondary text content</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Muted Text</p>
              <p className="text-text-muted">This is muted text content</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Accent Text</p>
              <p className="text-text-accent font-medium">This is accent text content</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Success Text</p>
              <p className="text-text-success font-medium">Operation completed successfully</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Warning Text</p>
              <p className="text-text-warning font-medium">Please review this content</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Error Text</p>
              <p className="text-text-error font-medium">An error has occurred</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Link Text</p>
              <p className="text-text-link font-medium hover:underline cursor-pointer">This is a clickable link</p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Mixed Content Example:</p>
          <div className="space-y-2">
            <p className="text-text-primary">
              Welcome to our platform! <span className="text-text-accent font-medium">Signa Tech</span> provides 
              <span className="text-text-link hover:underline cursor-pointer"> innovative solutions</span> for your business needs.
            </p>
            <p className="text-text-secondary">
              <span className="text-text-success">✓ Verified</span> | 
              <span className="text-text-warning"> ⚠ Review required</span> | 
              <span className="text-text-error"> ✗ Action needed</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextColorDemo;