import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import ServiceModal from './ServiceModal';

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

interface ServiceManagerProps {
  formData: { services: ServiceSpec[] };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ formData, setFormData }) => {
  const { t } = useLanguage();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceSpec>({
    id: '',
    serviceType: '',
    material: '',
    size: '',
    quantity: '',
    thickness: '',
    colors: '',
    finishing: '',
    cuttingApplication: '',
    designReady: '',
    cncFinishing: '',
    jobType: '',
    detailLevel: ''
  });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const handleAddService = () => {
    setCurrentService({
      id: Date.now().toString(),
      serviceType: '',
      material: '',
      size: '',
      quantity: '',
      thickness: '',
      colors: '',
      finishing: '',
      cuttingApplication: '',
      designReady: '',
      cncFinishing: '',
      jobType: '',
      detailLevel: ''
    });
    setEditingServiceId(null);
    setShowServiceModal(true);
  };

  const handleEditService = (service: ServiceSpec) => {
    setCurrentService(service);
    setEditingServiceId(service.id);
    setShowServiceModal(true);
  };

  const handleDeleteService = (serviceId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      services: prev.services.filter((s: ServiceSpec) => s.id !== serviceId)
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{t('contact.required_services')}</h3>
        <Button
          type="button"
          onClick={handleAddService}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Settings className="h-4 w-4 mr-2" />
          {t('contact.add_service')}
        </Button>
      </div>

      {formData.services.length > 0 && (
        <div className="space-y-3">
          {formData.services.map((service, index) => (
            <Card key={service.id} className="p-4 bg-gradient-subtle border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">
                    {t('contact.service')} {index + 1}: {service.serviceType || t('contact.not_specified')}
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {service.material && <p>{t('contact.material')}: {service.material}</p>}
                    {service.size && <p>{t('contact.size')}: {service.size}</p>}
                    {service.quantity && <p>{t('contact.quantity')}: {service.quantity}</p>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditService(service)}
                  >
                    {t('contact.edit')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    {t('contact.delete')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showServiceModal && (
        <ServiceModal
          currentService={currentService}
          setCurrentService={setCurrentService}
          editingServiceId={editingServiceId}
          onClose={() => setShowServiceModal(false)}
          onSave={(service) => {
            if (editingServiceId) {
              setFormData((prev: any) => ({
                ...prev,
                services: prev.services.map((s: ServiceSpec) => 
                  s.id === editingServiceId ? service : s
                )
              }));
            } else {
              setFormData((prev: any) => ({
                ...prev,
                services: [...prev.services, service]
              }));
            }
            setShowServiceModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ServiceManager;