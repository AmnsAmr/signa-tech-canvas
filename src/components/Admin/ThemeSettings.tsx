import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Palette, RotateCcw, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import ThemePreview from './ThemePreview';

const ThemeSettings = () => {
  const { theme, updateTheme, resetTheme, previewTheme, clearPreview, isLoading } = useTheme();
  const { t } = useLanguage();
  const [previewColors, setPreviewColors] = useState(theme);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync preview colors when theme changes
  React.useEffect(() => {
    setPreviewColors(theme);
  }, [theme]);

  const colorPresets = [
    {
      name: t('theme_settings.default_purple'),
      colors: {
        primary: '270 85% 60%',
        accent: '320 85% 65%'
      }
    },
    {
      name: t('theme_settings.ocean_blue'),
      colors: {
        primary: '210 100% 60%',
        accent: '190 100% 65%'
      }
    },
    {
      name: t('theme_settings.forest_green'),
      colors: {
        primary: '150 60% 50%',
        accent: '120 60% 55%'
      }
    },
    {
      name: t('theme_settings.sunset_orange'),
      colors: {
        primary: '25 95% 60%',
        accent: '45 95% 65%'
      }
    }
  ];

  const handleColorChange = (colorKey: string, value: string) => {
    const newColors = { ...previewColors, [colorKey]: value };
    setPreviewColors(newColors);
    
    if (isPreviewMode) {
      previewTheme(newColors);
    }
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
      await updateTheme(previewColors);
      setIsPreviewMode(false);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    const newColors = { ...previewColors, ...preset.colors };
    setPreviewColors(newColors);
    
    if (isPreviewMode) {
      previewTheme(newColors);
    }
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
            <p className="text-muted-foreground">{t('theme_settings.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('theme_settings.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Presets */}
          <div>
            <Label className="text-sm font-medium mb-3 block">{t('theme_settings.color_presets')}</Label>
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
                      style={{ backgroundColor: hslToHex(preset.colors.primary) }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: hslToHex(preset.colors.accent) }}
                    />
                  </div>
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">{t('theme_settings.custom_colors')}</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-color" className="text-xs">{t('theme_settings.primary_color')}</Label>
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
                <Label htmlFor="accent-color" className="text-xs">{t('theme_settings.accent_color')}</Label>
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
                <Label htmlFor="background-color" className="text-xs">{t('theme_settings.background')}</Label>
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
                <Label htmlFor="foreground-color" className="text-xs">{t('theme_settings.text_color')}</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="foreground-color"
                    type="color"
                    value={hslToHex(previewColors.foreground)}
                    onChange={(e) => handleColorChange('foreground', hexToHsl(e.target.value))}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={previewColors.foreground}
                    onChange={(e) => handleColorChange('foreground', e.target.value)}
                    placeholder="260 20% 15%"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview and Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant={isPreviewMode ? "destructive" : "secondary"}
              size="sm"
              onClick={togglePreview}
              className="flex items-center gap-2"
            >
              {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isPreviewMode ? t('theme_settings.stop_preview') : t('theme_settings.preview')}
            </Button>
            
            <Button
              onClick={applyTheme}
              disabled={!isPreviewMode || isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? t('theme_settings.saving') : t('theme_settings.apply_theme')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetTheme}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t('theme_settings.reset')}
            </Button>
          </div>

          {isPreviewMode && (
            <Badge variant="secondary" className="w-fit">
              <Eye className="h-3 w-3 mr-1" />
              {t('theme_settings.preview_mode_active')}
            </Badge>
          )}
        </CardContent>
          </Card>
        </div>
        
        <div>
          <ThemePreview />
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;