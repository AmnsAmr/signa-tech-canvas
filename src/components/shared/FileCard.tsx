import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileContextMenu from '@/components/FileContextMenu';

interface FileInfo {
  name: string;
  size: number;
  type?: string;
  path: string;
}

interface FileCardProps {
  fileInfo: FileInfo | null;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  submissionId: number;
  isAdmin?: boolean;
  onDownload?: (filePath: string, fileName: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileCard: React.FC<FileCardProps> = ({
  fileInfo,
  fileName,
  filePath,
  fileSize,
  submissionId,
  isAdmin = false,
  onDownload
}) => {
  // Use fileInfo if available, otherwise use individual props
  const name = fileInfo?.name || fileName || '';
  const path = fileInfo?.path || filePath || '';
  const size = fileInfo?.size || fileSize || 0;

  const handleDownload = () => {
    if (onDownload && path && name) {
      onDownload(path, name);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-green-600" />
          <div>
            <h5 className="text-sm font-medium text-green-800">Fichier vectoriel joint</h5>
            <p className="text-xs text-green-600">{name}</p>
            <p className="text-xs text-green-500">{formatFileSize(size)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          
          <FileContextMenu
            fileId={submissionId}
            fileName={name}
            filePath={path}
            isAdmin={isAdmin}
            submissionId={submissionId}
          >
            <Button
              size="sm"
              variant="outline"
              className="border-green-300 hover:bg-green-100"
            >
              <FileText className="h-4 w-4 mr-2" />
              Options
            </Button>
          </FileContextMenu>
        </div>
      </div>
    </div>
  );
};

export default FileCard;