import { useState, useCallback, useEffect, useRef } from "react";
import { Camera, Upload, X, ImageIcon, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uploadImage, getStorageUrl } from "@/lib/supabase";
import { compressImage, normalizeImagePath } from "@/lib/image-compression";
import { searchProductImages, fetchImageAsFile } from "@/lib/serper-search";
import { useToast } from "@/hooks/use-toast";

interface ProductImageUploaderProps {
  currentImageUrl?: string | null;
  onImageUploaded: (imagePath: string) => void;
  onImageRemoved?: () => void;
  disabled?: boolean;
  folder?: string;
  productName?: string;
}

interface SearchResult {
  imageUrl: string;
  title: string;
  source: string;
}

export function ProductImageUploader({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  disabled = false,
  folder = "products",
  productName = "",
}: ProductImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentImageUrl) {
      const normalizedPath = normalizeImagePath(currentImageUrl);
      const displayUrl = getStorageUrl(normalizedPath);
      setPreviewUrl(displayUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [currentImageUrl]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const compressedFile = await compressImage(file);
      
      const { path, publicUrl } = await uploadImage(compressedFile, folder);
      
      
      // We always set the preview to the publicUrl returned by the server
      setPreviewUrl(publicUrl);
      
      // Ensure we send the full public URL to the parent component
      onImageUploaded(publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha ao enviar imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [folder, onImageUploaded, toast]);

  const handleRemoveImage = useCallback(() => {
    setPreviewUrl(null);
    onImageRemoved?.();
  }, [onImageRemoved]);

  const handleSearchImages = useCallback(async () => {
    if (!productName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do produto para pesquisar.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchProductImages(productName);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "Nenhuma imagem encontrada",
          description: "Tente outro nome para o produto.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na pesquisa",
        description: "Falha ao pesquisar imagens. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [productName, toast]);

  const handleSelectSearchResult = useCallback(async (result: SearchResult) => {
    setIsUploading(true);
    try {
      const imageFile = await fetchImageAsFile(result.imageUrl, "product.jpg");
      
      const compressedFile = await compressImage(imageFile);
      
      const { path, publicUrl } = await uploadImage(compressedFile, folder);
      
      
      // We always set the preview to the publicUrl returned by the server
      setPreviewUrl(publicUrl);
      
      // Ensure we send the full public URL to the parent component
      onImageUploaded(publicUrl);
      setShowSearchModal(false);
      setSearchResults([]);
      
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha ao enviar imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [folder, onImageUploaded, toast]);

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-camera-capture"
      />

      <div className="relative w-full aspect-square max-w-[200px] mx-auto bg-muted rounded-md overflow-hidden border border-border">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
              data-testid="img-product-preview"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/400x400?text=Erro+na+Imagem';
              }}
            />
            {!disabled && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                type="button"
                data-testid="button-remove-image"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2" />
            <span className="text-sm">Sem imagem</span>
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          type="button"
          data-testid="button-upload-image"
        >
          <Upload className="h-4 w-4 mr-2" />
          Enviar Imagem
        </Button>

        <Button
          variant="outline"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled || isUploading}
          type="button"
          data-testid="button-camera-capture"
        >
          <Camera className="h-4 w-4 mr-2" />
          Câmera
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowSearchModal(true)}
          disabled={disabled || isUploading}
          type="button"
          data-testid="button-search-image"
        >
          <Search className="h-4 w-4 mr-2" />
          Pesquisar
        </Button>
      </div>

      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pesquisar Imagem do Produto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {searchResults.length === 0 ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Pesquise por imagens de "{productName}" na internet
                </p>
                <Button
                  onClick={handleSearchImages}
                  disabled={isSearching || !productName.trim()}
                  data-testid="button-perform-search"
                >
                  {isSearching && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Pesquisar Imagens
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer relative overflow-hidden rounded-lg border"
                    onClick={() => handleSelectSearchResult(result)}
                    data-testid={`button-select-image-${index}`}
                  >
                    <img
                      src={result.imageUrl}
                      alt={result.title}
                      className="w-full h-40 object-cover group-hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isUploading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSearchResult(result);
                        }}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Selecionar"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs p-2 line-clamp-2">{result.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
