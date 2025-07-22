import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ServiceItem {
  serviceType?: string;
  material?: string;
  size?: string;
  quantity?: string;
  thickness?: string;
  colors?: string;
  finishing?: string;
  cuttingApplication?: string;
}

interface ServiceCardProps {
  service: ServiceItem;
  index?: number;
  compact?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service = {}, index = 0, compact = false }) => {
  return (
    <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-md border border-primary/20 hover:border-primary/40 transition-colors">
      {!compact ? (
        <>
          <h6 className="font-medium mb-3 text-primary">
            Service {index + 1}: {service.serviceType || 'Non spécifié'}
          </h6>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {service.material && (
              <div>
                <span className="font-medium">Matériau:</span>
                <p className="text-muted-foreground">{service.material}</p>
              </div>
            )}
            {service.size && (
              <div>
                <span className="font-medium">Taille:</span>
                <p className="text-muted-foreground">{service.size}</p>
              </div>
            )}
            {service.quantity && (
              <div>
                <span className="font-medium">Quantité:</span>
                <p className="text-muted-foreground">{service.quantity}</p>
              </div>
            )}
            {service.thickness && (
              <div>
                <span className="font-medium">Épaisseur:</span>
                <p className="text-muted-foreground">{service.thickness}</p>
              </div>
            )}
            {service.colors && (
              <div>
                <span className="font-medium">Couleurs:</span>
                <p className="text-muted-foreground">{service.colors}</p>
              </div>
            )}
            {service.finishing && (
              <div>
                <span className="font-medium">Finition:</span>
                <p className="text-muted-foreground">{service.finishing}</p>
              </div>
            )}
            {service.cuttingApplication && (
              <div>
                <span className="font-medium">Application de découpe:</span>
                <p className="text-muted-foreground">{service.cuttingApplication}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-2">
            <Badge variant="secondary" className="text-xs mr-2">
              {service.serviceType || 'Service'} #{index + 1}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {service.material && (
              <div>
                <span className="font-medium">Matériau:</span>
                <p className="text-muted-foreground truncate">{service.material}</p>
              </div>
            )}
            {service.size && (
              <div>
                <span className="font-medium">Taille:</span>
                <p className="text-muted-foreground truncate">{service.size}</p>
              </div>
            )}
            {service.quantity && (
              <div>
                <span className="font-medium">Quantité:</span>
                <p className="text-muted-foreground truncate">{service.quantity}</p>
              </div>
            )}
            {service.thickness && (
              <div>
                <span className="font-medium">Épaisseur:</span>
                <p className="text-muted-foreground truncate">{service.thickness}</p>
              </div>
            )}
            {service.colors && (
              <div>
                <span className="font-medium">Couleurs:</span>
                <p className="text-muted-foreground truncate">{service.colors}</p>
              </div>
            )}
            {service.finishing && (
              <div>
                <span className="font-medium">Finition:</span>
                <p className="text-muted-foreground truncate">{service.finishing}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceCard;