import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { secureApiRequest } from '@/utils/csrf';
import { Trash2, File, Download, RefreshCw, Eye, Image } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  created: string;
  modified: string;
}

const FileManager = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteFile, setDeleteFile] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await secureApiRequest('/api/admin/files', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDeleteFile = async () => {
    if (!deleteFile) return;

    try {
      const token = localStorage.getItem('token');
      const response = await secureApiRequest(`/api/admin/files/${deleteFile}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'File deleted successfully'
        });
        setFiles(prev => prev.filter(f => f.name !== deleteFile));
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Delete file error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive'
      });
    } finally {
      setDeleteFile(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isImageFile = (filename: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const getFileIcon = (filename: string) => {
    if (isImageFile(filename)) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  const handlePreviewFile = (filename: string) => {
    if (isImageFile(filename)) {
      setPreviewFile(filename);
    } else {
      toast({
        title: 'Preview not available',
        description: 'Preview is only available for image files',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading files...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">File Management</h1>
          <p className="text-muted-foreground">Manage uploaded files and prevent storage buildup</p>
        </div>
        <Button onClick={fetchFiles} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Uploaded Files ({files.length})
            {files.filter(f => isImageFile(f.name)).length > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                ({files.filter(f => isImageFile(f.name)).length} images)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No files found in uploads folder
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename (Click to preview)</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.name}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.name)}
                          <button
                            onClick={() => handlePreviewFile(file.name)}
                            className={`truncate max-w-[200px] text-left transition-colors ${
                              isImageFile(file.name) 
                                ? 'hover:text-blue-600 hover:underline cursor-pointer' 
                                : 'cursor-default'
                            }`}
                            title={isImageFile(file.name) ? `Click to preview ${file.name}` : file.name}
                            disabled={!isImageFile(file.name)}
                          >
                            {file.name}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{formatDate(file.created)}</TableCell>
                      <TableCell>{formatDate(file.modified)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isImageFile(file.name) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreviewFile(file.name)}
                              title="Preview image"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `/uploads/${file.name}`;
                              link.download = file.name;
                              link.click();
                            }}
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteFile(file.name)}
                            title="Delete file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteFile !== null} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteFile}</strong>? This action cannot be undone and will permanently remove the file from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} className="bg-red-600 hover:bg-red-700">
              Delete File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={previewFile !== null} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Image Preview: {previewFile}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {previewFile && (
              <img
                src={`/uploads/${previewFile}`}
                alt={previewFile}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'text-center text-muted-foreground p-8';
                  errorDiv.innerHTML = `
                    <div class="flex flex-col items-center gap-2">
                      <File class="h-12 w-12 text-muted-foreground" />
                      <p>Unable to load image preview</p>
                      <p class="text-sm">${previewFile}</p>
                    </div>
                  `;
                  target.parentNode?.appendChild(errorDiv);
                }}
              />
            )}
          </div>
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              {previewFile && (
                <span>File: {previewFile}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (previewFile) {
                    const link = document.createElement('a');
                    link.href = `/uploads/${previewFile}`;
                    link.download = previewFile;
                    link.click();
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (previewFile) {
                    setDeleteFile(previewFile);
                    setPreviewFile(null);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManager;