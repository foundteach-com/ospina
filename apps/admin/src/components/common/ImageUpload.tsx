'use client';

import { useState } from 'react';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  folder?: string;
  currentImageUrl?: string;
  label?: string;
}

export default function ImageUpload({ 
  onUploadSuccess, 
  folder = 'products', 
  currentImageUrl,
  label = 'Imagen del Producto'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);

      // Robust API URL detection for production
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (typeof window !== 'undefined' && (apiUrl.includes('localhost') || !apiUrl)) {
        const hostname = window.location.hostname;
        if (hostname.includes('ospinacomercializadoraysuministros.com')) {
          apiUrl = 'https://api.ospinacomercializadoraysuministros.com';
        }
      }

      const response = await fetch(`${apiUrl}/storage/upload?folder=${folder}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUploadSuccess(data.url);
      } else {
        const errorText = await response.text();
        let errorMessage = 'Error desconocido';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        alert(`Error al subir imagen: ${errorMessage}`);
        setPreview(currentImageUrl || null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error de conexión al subir imagen');
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Preview Area */}
        <div className="w-full md:w-48 aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group relative transition-colors hover:border-blue-400">
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              {uploading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-400 flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <span className="text-xs">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1 space-y-2">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className={`px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium flex items-center justify-center gap-2 transition-all shadow-sm ${uploading ? 'opacity-50' : 'hover:bg-gray-50 hover:border-gray-300'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Formatos recomendados: JPG, PNG, WebP. Tamaño máx: 5MB.
          </p>
          {preview && !uploading && (
            <button 
              type="button"
              onClick={() => {
                setPreview(null);
                onUploadSuccess('');
              }}
              className="text-xs text-red-500 hover:text-red-600 transition-colors font-medium flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              Eliminar imagen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
