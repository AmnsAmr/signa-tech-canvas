import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Circle, Square, Ruler, FileType, AlertCircle } from 'lucide-react';

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
  fileInfo?: {
    size?: string;
    pages?: number | string;
    format?: string;
  };
}

interface VectorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: VectorDetails | null;
  loading: boolean;
}

const VectorDetailsModal: React.FC<VectorDetailsModalProps> = ({
  isOpen,
  onClose,
  details,
  loading
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {loading ? 'Chargement des détails...' : details?.fileName || 'Détails du fichier'}
          </DialogTitle>
          <DialogDescription>
            {details?.fileType && (
              <Badge variant="outline" className="mr-2">
                {details.fileType}
              </Badge>
            )}
            {details?.units && `Unités: ${details.units}`}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : details?.error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            <p className="font-semibold">Erreur d'analyse</p>
            <p>{details.error}</p>
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* File Info Section */}
            {details.fileInfo && (
              <Card className="bg-blue-50/50 border-blue-200">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-blue-800">Informations sur le fichier</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {details.fileInfo.format && (
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Format</p>
                        <p className="text-lg font-bold">{details.fileInfo.format}</p>
                      </div>
                    )}
                    {details.fileInfo.size && (
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Taille</p>
                        <p className="text-lg font-bold">{details.fileInfo.size}</p>
                      </div>
                    )}
                    {details.fileInfo.pages && (
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Pages</p>
                        <p className="text-lg font-bold">{details.fileInfo.pages}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Square className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium">Surface du papier</h3>
                  </div>
                  <p className="text-2xl font-bold">{details.paperArea}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Circle className="h-4 w-4 text-green-500" />
                    <h3 className="font-medium">Surface des formes</h3>
                  </div>
                  <p className="text-2xl font-bold">{details.letterArea}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="h-4 w-4 text-amber-500" />
                    <h3 className="font-medium">Longueur totale</h3>
                  </div>
                  <p className="text-2xl font-bold">{details.pathLength}</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Formes ({details.shapes.length})</h3>
                {details.shapes.length > 1 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Total: {details.shapes.length} formes
                  </Badge>
                )}
              </div>
              
              {details.shapes.length > 0 ? (
                <div className="space-y-3">
                  {details.shapes.map((shape, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{shape.name}</h4>
                            <div className="text-sm text-muted-foreground mt-1">
                              <p>Longueur: {shape.length}</p>
                              <p>Surface: {shape.area}</p>
                            </div>
                          </div>
                          <Badge variant={shape.area.includes('Open') || shape.area.includes('Unknown') ? 'secondary' : 'default'}>
                            {shape.area.includes('Open') ? 'Ouvert' : 
                             shape.area.includes('Unknown') ? 'Info limitée' : 'Fermé'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {details.shapes.length > 3 && (
                    <Card className="bg-blue-50/50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-blue-800">Totaux</h4>
                            <div className="text-sm text-blue-700 mt-1">
                              <p>Longueur totale: {details.pathLength}</p>
                              <p>Surface totale: {details.letterArea}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-800">Aucune forme détectée</p>
                    <p className="text-sm text-amber-700">
                      {details.fileType === 'PDF' ? 
                        "L'analyse des fichiers PDF nécessite des bibliothèques supplémentaires." :
                        details.fileType === 'AI' || details.fileType === 'EPS' ?
                        "L'analyse des fichiers AI/EPS nécessite des bibliothèques spécialisées." :
                        "Aucune forme n'a pu être détectée dans ce fichier."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Aucune information disponible
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VectorDetailsModal;