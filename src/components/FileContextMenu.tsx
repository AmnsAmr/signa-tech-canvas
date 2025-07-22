import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Eye, Download, Info } from 'lucide-react';
import VectorDetailsModal from './VectorDetailsModal';
import { useToast } from '@/hooks/use-toast';

interface VectorShape {
  name: string;
  length: string;
  area: string;
}

interface VectorDetails {
  fileName: string;
  paperArea: string;
  letterArea: string | number;
  pathLength: string | number;
  shapes: VectorShape[];
  fileType?: string;
  units?: string;
  error?: string;
}

interface FileContextMenuProps {
  children: React.ReactNode;
  fileId: number;
  fileName: string;
  filePath: string;
  isAdmin?: boolean;
  submissionId?: number;
}

const FileContextMenu: React.FC<FileContextMenuProps> = ({
  children,
  fileId,
  fileName,
  filePath,
  isAdmin = false,
  submissionId
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<VectorDetails | null>(null);
  const { toast } = useToast();

  const fetchVectorDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Use the correct endpoint based on what we have
      // If we have a submissionId, use that as the primary identifier
      // Otherwise fall back to fileId
      const idToUse = submissionId || fileId;
      const endpoint = `/api/contact/analyze-file/${idToUse}`;
      
      console.log(`Fetching vector details from: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.message || "Impossible de récupérer les détails du fichier",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching vector details:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des détails",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    setDetailsOpen(true);
    fetchVectorDetails();
  };

  const handleDownload = () => {
    // Use the API endpoint for downloads instead of direct file path
    const token = localStorage.getItem('token');
    
    // Extract just the filename without path
    const filenameOnly = filePath.split(/[\\/]/).pop() || filePath;
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = `/api/contact/download/${filenameOnly}?token=${token}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleView = () => {
    // Use the API endpoint for viewing instead of direct file path
    const token = localStorage.getItem('token');
    
    // Extract just the filename without path
    const filenameOnly = filePath.split(/[\\/]/).pop() || filePath;
    
    // Open in new tab
    window.open(`/api/contact/download/${filenameOnly}?token=${token}`, '_blank');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onClick={handleView} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Voir le fichier</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Télécharger</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewDetails} className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Voir les détails vectoriels</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <VectorDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        details={details}
        loading={loading}
      />
    </>
  );
};

export default FileContextMenu;