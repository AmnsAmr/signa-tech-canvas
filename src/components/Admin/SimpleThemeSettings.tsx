import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, RotateCcw, Eye, EyeOff, History } from 'lucide-react';
import ThemePreview from './ThemePreview';

const SimpleThemeSettings = () => {
  const { theme, updateTheme, resetTheme, previewTheme, clearPreview, isLoading } = useTheme();
  const [previewColors, setPreviewColors] = useState(theme);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [themeHistory, setThemeHistory] = useState<typeof theme[]>([]);

  React.useEffect(() => {
    setPreviewColors(theme);
  }, [theme]);

  // Load theme history from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('themeHistory');
    if (saved) {
      try {
        setThemeHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load theme history:', e);
      }
    }
  }, []);

  const saveToHistory = (themeToSave: typeof theme) => {
    const newHistory = [themeToSave, ...themeHistory.filter(h => JSON.stringify(h) !== JSON.stringify(themeToSave))].slice(0, 10);
    setThemeHistory(newHistory);
    localStorage.setItem('themeHistory', JSON.stringify(newHistory));
  };

  const loadFromHistory = (historicTheme: typeof theme) => {
    setPreviewColors(historicTheme);
    if (isPreviewMode) previewTheme(historicTheme);
  };

  const colorPresets = [
    { 
      name: 'Default Purple', 
      primary: '270 85% 60%', 
      accent: '320 85% 65%',
      gradientStart: '270 85% 60%',
      gradientEnd: '320 85% 65%'
    },
    { 
      name: 'Ocean Blue', 
      primary: '210 100% 60%', 
      accent: '190 100% 65%',
      gradientStart: '210 100% 60%',
      gradientEnd: '190 100% 65%'
    },
    { 
      name: 'Forest Green', 
      primary: '150 60% 50%', 
      accent: '120 60% 55%',
      gradientStart: '150 60% 50%',
      gradientEnd: '120 60% 55%'
    },
    { 
      name: 'Sunset Orange', 
      primary: '25 95% 60%', 
      accent: '45 95% 65%',
      gradientStart: '25 95% 60%',
      gradientEnd: '45 95% 65%'
    }
  ];

  const handleColorChange = (colorKey: string, value: string) => {
    const newColors = { ...previewColors, [colorKey]: value };
    setPreviewColors(newColors);
    if (isPreviewMode) previewTheme(newColors);
  };

  const togglePreview = () => {
    if (isPreviewMode) {
      clearPreview();
      setIsPreviewMode(false);
    } else {
      previewTheme(previewColors);
      setIsPreviewMode(true);
    }
  };

  const applyTheme = async () => {
    setIsSaving(true);
    try {
      saveToHistory(theme); // Save current theme before applying new one
      await updateTheme(previewColors);
      setIsPreviewMode(false);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    const newColors = { 
      ...previewColors, 
      primary: preset.primary, 
      accent: preset.accent,
      gradientStart: preset.gradientStart,
      gradientEnd: preset.gradientEnd
    };
    setPreviewColors(newColors);
    if (isPreviewMode) previewTheme(newColors);
  };

  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));
    const sNorm = s / 100;
    const lNorm = l / 100;
    
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading theme settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Presets */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Color Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="justify-start gap-2"
                  >
                    <div className="flex gap-1">
                      <div 
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: hslToHex(preset.primary) }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: hslToHex(preset.accent) }}
                      />
                    </div>
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Custom Colors</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color" className="text-xs">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primary-color"
                      type="color"
                      value={hslToHex(previewColors.primary)}
                      onChange={(e) => handleColorChange('primary', hexToHsl(e.target.value))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={previewColors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      placeholder="270 85% 60%"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color" className="text-xs">Accent Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="accent-color"
                      type="color"
                      value={hslToHex(previewColors.accent)}
                      onChange={(e) => handleColorChange('accent', hexToHsl(e.target.value))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={previewColors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      placeholder="320 85% 65%"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="background-color" className="text-xs">Background</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="background-color"
                      type="color"
                      value={hslToHex(previewColors.background)}
                      onChange={(e) => handleColorChange('background', hexToHsl(e.target.value))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={previewColors.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      placeholder="0 0% 99%"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="card-color" className="text-xs">Card Background</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="card-color"
                      type="color"
                      value={hslToHex(previewColors.card)}
                      onChange={(e) => handleColorChange('card', hexToHsl(e.target.value))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={previewColors.card}
                      onChange={(e) => handleColorChange('card', e.target.value)}
                      placeholder="0 0% 100%"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Gradient Settings</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gradient-start" className="text-xs">Gradient Start</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="gradient-start"
                      type="color"
                      value={hslToHex(previewColors.gradientStart)}
                      onChange={(e) => handleColorChange('gradientStart', hexToHsl(e.target.value))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={previewColors.gradientStart}
                      onChange={(e) => handleColorChange('gradientStart', e.target.value)}
                      placeholder="270 85% 60%"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gradient-end" className="text-xs">Gradient End</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="gradient-end"
                      type="color"
                      value={hslToHex(previewColors.gradientEnd)}
                      onChange={(e) => handleColorChange('gradientEnd', hexToHsl(e.target.value))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={previewColors.gradientEnd}
                      onChange={(e) => handleColorChange('gradientEnd', e.target.value)}
                      placeholder="320 85% 65%"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="gradient-direction" className="text-xs">Gradient Direction</Label>
                  <div className="space-y-2">
                    <select
                      id="gradient-direction"
                      value={previewColors.gradientDirection}
                      onChange={(e) => handleColorChange('gradientDirection', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="135deg">Diagonal Down-Right (↘)</option>
                      <option value="90deg">Top to Bottom (↓)</option>
                      <option value="0deg">Left to Right (→)</option>
                      <option value="45deg">Diagonal Up-Right (↗)</option>
                      <option value="180deg">Right to Left (←)</option>
                      <option value="270deg">Bottom to Top (↑)</option>
                      <option value="225deg">Diagonal Down-Left (↙)</option>
                      <option value="315deg">Diagonal Up-Left (↖)</option>
                    </select>
                    <div 
                      className="h-8 rounded border"
                      style={{
                        background: `linear-gradient(${previewColors.gradientDirection}, ${hslToHex(previewColors.gradientStart)}, ${hslToHex(previewColors.gradientEnd)})`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Theme History */}
            {themeHistory.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Theme History
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {themeHistory.map((historicTheme, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => loadFromHistory(historicTheme)}
                      className="justify-start gap-2 h-auto p-2"
                    >
                      <div className="flex gap-1">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: hslToHex(historicTheme.primary) }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: hslToHex(historicTheme.accent) }}
                        />
                      </div>
                      <span className="text-xs">Theme {index + 1}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                variant={isPreviewMode ? "destructive" : "secondary"}
                size="sm"
                onClick={togglePreview}
                className="flex items-center gap-2"
              >
                {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {isPreviewMode ? 'Stop Preview' : 'Preview'}
              </Button>
              
              <Button
                onClick={applyTheme}
                disabled={!isPreviewMode || isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : 'Apply Theme'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetTheme}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <ThemePreview />
      </div>
    </div>
  );
};

export default SimpleThemeSettings;