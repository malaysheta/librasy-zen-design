import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedFile: File | null;
  previewUrl: string | null;
}

export function ImageUpload({ onImageSelect, onImageRemove, selectedFile, previewUrl }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      onImageSelect(file);
    }
  };

  const handleRemoveFile = () => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="imageUpload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Cover Image</span>
        </Button>
        
        {selectedFile && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {selectedFile.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Image Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Preview:</p>
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Cover preview"
              className="w-32 h-48 object-cover rounded border shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
