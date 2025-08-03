import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceSpec {
  id: string;
  serviceType: string;
  material: string;
  size: string;
  quantity: string;
  thickness: string;
  colors: string;
  finishing: string;
  cuttingApplication: string;
  designReady: string;
  cncFinishing: string;
  jobType: string;
  detailLevel: string;
}

interface ServiceModalProps {
  currentService: ServiceSpec;
  setCurrentService: React.Dispatch<React.SetStateAction<ServiceSpec>>;
  editingServiceId: string | null;
  onClose: () => void;
  onSave: (service: ServiceSpec) => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  currentService,
  setCurrentService,
  editingServiceId,
  onClose,
  onSave
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSave = () => {
    if (!currentService.serviceType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de service",
        variant: "destructive"
      });
      return;
    }

    onSave(currentService);
    toast({
      title: "Service ajouté",
      description: "Le service a été ajouté à votre demande"
    });
  };

  const materials = {
    printing: ['Forex', 'Alucobond', 'Plexiglass', 'Vinyle', 'Bâche', 'Toile'],
    cutting: ['Vinyle', 'Flex'],
    cnc: ['Forex', 'Plexiglass', 'Aluminum', 'Bois'],
    laser: ['Plexiglass', 'Bois']
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      
      <Card className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">
              {editingServiceId ? t('contact.edit_service') : t('contact.add_service')}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('contact.service_type')} *
              </label>
              <Select 
                value={currentService.serviceType} 
                onValueChange={(value) => setCurrentService(prev => ({ ...prev, serviceType: value }))}
              >
                <SelectTrigger className="border-border/50 focus:border-primary">
                  <SelectValue placeholder={t('contact.select_service')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="printing">{t('contact.printing')}</SelectItem>
                  <SelectItem value="cutting">{t('contact.cutting')}</SelectItem>
                  <SelectItem value="cnc">{t('contact.cnc')}</SelectItem>
                  <SelectItem value="laser">{t('contact.laser')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentService.serviceType && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    {t('contact.material')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {materials[currentService.serviceType as keyof typeof materials]?.map((material) => (
                      <button
                        key={material}
                        type="button"
                        onClick={() => setCurrentService(prev => ({ 
                          ...prev, 
                          material: prev.material === material ? '' : material 
                        }))}
                        className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                          currentService.material === material
                            ? 'bg-gradient-primary text-white border-primary shadow-glow'
                            : 'bg-background border-border/50 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {material}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('contact.size')}
                    </label>
                    <Input 
                      value={currentService.size}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, size: e.target.value }))}
                      placeholder={t('contact.size_example')}
                      className="border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('contact.quantity')}
                    </label>
                    <Input 
                      value={currentService.quantity}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder={t('contact.quantity_example')}
                      className="border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {(currentService.serviceType === 'cutting' || currentService.serviceType === 'cnc' || currentService.serviceType === 'laser') && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('contact.thickness')}
                    </label>
                    <Input 
                      value={currentService.thickness}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, thickness: e.target.value }))}
                      placeholder={t('contact.thickness_example')}
                      className="border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                )}

                {currentService.serviceType === 'cutting' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('contact.colors')}
                    </label>
                    <Input 
                      value={currentService.colors}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, colors: e.target.value }))}
                      placeholder={t('contact.colors_example')}
                      className="border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                )}

                {currentService.serviceType === 'printing' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('contact.finishing')}
                    </label>
                    <Input 
                      value={currentService.finishing}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, finishing: e.target.value }))}
                      placeholder={t('contact.finishing_example')}
                      className="border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                {t('contact.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="bg-gradient-primary hover:opacity-90"
                disabled={!currentService.serviceType}
              >
                {editingServiceId ? t('contact.edit') : t('contact.add')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceModal;