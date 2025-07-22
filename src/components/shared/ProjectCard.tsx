import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Check, Clock, Paperclip } from 'lucide-react';
import FileCard from './FileCard';
import ServiceCard from './ServiceCard';

interface Service {
  serviceType?: string;
  material?: string;
  size?: string;
  quantity?: string;
  thickness?: string;
  colors?: string;
  finishing?: string;
  cuttingApplication?: string;
}

interface FileInfo {
  name: string;
  size: number;
  type?: string;
  path: string;
}

interface ProjectCardProps {
  id: number;
  name: string;
  message: string;
  status: 'pending' | 'done';
  createdAt: string;
  hasFile?: boolean;
  fileInfo?: FileInfo | null;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  services?: Service[];
  project?: string;
  submissionGroup?: string;
  userInfo?: {
    name?: string;
    email?: string;
  };
  onStatusChange?: (id: number, status: 'pending' | 'done') => void;
  onDownloadFile?: (filePath: string, fileName: string) => void;
  isAdmin?: boolean;
  isExpanded?: boolean;
  groupId?: string;
}

// Helper function to extract group ID from submission_group string
const getGroupId = (submissionGroup?: string): string => {
  if (!submissionGroup) return 'N/A';
  
  // If it's just a number, return it
  if (/^\\d+$/.test(submissionGroup)) {
    return submissionGroup;
  }
  
  // Handle format: group_timestamp_randomstring
  const parts = submissionGroup.split('_');
  if (parts.length >= 3) {
    // Return the random string part (last part)
    return parts[parts.length - 1].substring(0, 8).toUpperCase();
  }
  
  // Handle format: group_123456789
  if (parts.length === 2 && parts[0] === 'group') {
    // Create a hash-like ID from timestamp
    const timestamp = parts[1];
    const hash = timestamp.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
  }
  
  // Fallback - create a simple hash
  const hash = submissionGroup.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  message,
  status,
  createdAt,
  hasFile = false,
  fileInfo = null,
  fileName,
  filePath,
  fileSize,
  services = [] as Service[],
  project,
  submissionGroup,
  userInfo,
  onStatusChange,
  onDownloadFile,
  isAdmin = false,
  isExpanded = false,
  groupId
}) => {
  const displayGroupId = groupId || (submissionGroup ? getGroupId(submissionGroup) : undefined);
  
  return (
    <Card className={`border-l-4 ${status === 'done' ? 'border-l-green-500 bg-green-50/50' : 'border-l-primary'} card-hover-effect`}>
      <CardContent className="p-4">
        <details className="group" open={isExpanded}>
          <summary className="cursor-pointer list-none">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{name}</h3>
                  <Badge variant={status === 'done' ? 'default' : 'secondary'} className="text-xs">
                    {status === 'done' ? 'Terminé' : 'En attente'}
                  </Badge>
                  {Array.isArray(services) && services.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {services.length} service{services.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {displayGroupId && (
                    <Badge variant="outline" className="text-xs bg-blue-50">
                      ID: {displayGroupId}
                    </Badge>
                  )}
                  {hasFile && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <Paperclip className="h-3 w-3 mr-1" />
                      Fichier joint
                    </Badge>
                  )}
                </div>
                {userInfo && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {userInfo.name} • {userInfo.email}
                  </p>
                )}
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(createdAt).toLocaleDateString()}
                </div>
              </div>
              {onStatusChange && (
                <Button
                  size="sm"
                  variant={status === 'done' ? 'outline' : 'default'}
                  onClick={() => onStatusChange(id, status === 'done' ? 'pending' : 'done')}
                  className="ml-2"
                >
                  {status === 'done' ? (
                    <><Clock className="h-3 w-3 mr-1" />Rouvrir</>
                  ) : (
                    <><Check className="h-3 w-3 mr-1" />Marquer terminé</>
                  )}
                </Button>
              )}
            </div>
            
            {project && (
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  Projet: {project}
                </Badge>
              </div>
            )}
            
            <div className="bg-gradient-to-r from-muted/40 to-muted/20 p-4 rounded-md text-sm mb-3 border border-muted/50">
              <div className="message-content">
                <p>{message}</p>
              </div>
              <span className="text-xs inline-flex items-center gap-1 text-primary font-medium mt-2 group-open:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                Voir plus
              </span>
              <span className="text-xs inline-flex items-center gap-1 text-primary font-medium mt-2 hidden group-open:inline-flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                Voir moins
              </span>
            </div>
          </summary>
          
          {/* Content shown when expanded */}
          <div className="mt-4">
            {/* File Download Section */}
            {hasFile && (
              <FileCard
                fileInfo={fileInfo}
                fileName={fileName}
                filePath={filePath}
                fileSize={fileSize}
                submissionId={id}
                isAdmin={isAdmin}
                onDownload={onDownloadFile}
              />
            )}
            
            {/* Services Section */}
            {Array.isArray(services) && services.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Services demandés ({services.length}):</h4>
                {Array.isArray(services) && services.map((service, index) => (
                  <ServiceCard 
                    key={index} 
                    service={service} 
                    index={index} 
                    compact={isAdmin}
                  />
                ))}
              </div>
            )}
            
            {/* Show a message if there are no services but there is a file */}
            {(!Array.isArray(services) || services.length === 0) && hasFile && (
              <div className="text-center py-2 text-muted-foreground text-sm">
                Aucun service demandé avec ce fichier.
              </div>
            )}
          </div>
        </details>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;