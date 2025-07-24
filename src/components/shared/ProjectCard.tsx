import React, { useState } from 'react';
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
  
  const [isLocalExpanded, setIsLocalExpanded] = useState(isExpanded);
  const previewLength = 120;
  const shouldTruncate = message.length > previewLength;
  const truncatedMessage = shouldTruncate ? message.substring(0, previewLength) + '...' : message;

  return (
    <Card 
      data-card
      className={`border-l-4 transition-all duration-300 hover:shadow-md flex flex-col ${
        status === 'done' ? 'border-l-green-500 bg-green-50/30' : 'border-l-primary'
      }`}
    >
      <CardContent className="p-4 w-full max-w-full overflow-hidden">
        <div className="space-y-3 w-full max-w-full">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-semibold text-base truncate">{name}</h3>
                <div className="flex flex-wrap gap-1">
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
                      Fichier
                    </Badge>
                  )}
                </div>
              </div>
              {userInfo && (
                <p className="text-sm text-muted-foreground mb-1 truncate">
                  {userInfo.name} • {userInfo.email}
                </p>
              )}
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(createdAt).toLocaleDateString()}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              {onStatusChange && (
                <Button
                  size="sm"
                  variant={status === 'done' ? 'outline' : 'default'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(id, status === 'done' ? 'pending' : 'done');
                  }}
                  className="shrink-0"
                >
                  {status === 'done' ? (
                    <><Clock className="h-3 w-3 mr-1" />Rouvrir</>
                  ) : (
                    <><Check className="h-3 w-3 mr-1" />Terminé</>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {project && (
            <div>
              <Badge variant="outline" className="text-xs">
                Projet: {project}
              </Badge>
            </div>
          )}
          
          {/* Message Preview Section */}
          <div className="bg-gradient-to-r from-muted/30 to-muted/10 p-3 rounded-lg border border-muted/30">
            <div className="text-sm leading-relaxed">
              <p className="whitespace-pre-wrap break-words">
                {isLocalExpanded ? message : truncatedMessage}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLocalExpanded(!isLocalExpanded);
                }}
                className="text-xs text-primary font-medium mt-2 hover:underline focus:outline-none focus:underline inline-flex items-center gap-1 transition-colors"
              >
                {isLocalExpanded ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    Voir moins
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    Voir plus
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Expanded Content */}
          {isLocalExpanded && (
            <div className="space-y-3 pt-3 border-t border-muted/30 animate-in slide-in-from-top-2 duration-300">
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
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Services demandés ({services.length}):
                  </h4>
                  <div className="grid gap-2">
                    {services.map((service, index) => (
                      <ServiceCard 
                        key={index} 
                        service={service} 
                        index={index} 
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Show a message if there are no services but there is a file */}
              {(!Array.isArray(services) || services.length === 0) && hasFile && (
                <div className="text-center py-2 text-muted-foreground text-sm">
                  Aucun service demandé avec ce fichier.
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;