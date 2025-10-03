import { useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExtractedMedication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
}

export const MedicationUpload = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    await processImage(file);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64Image = reader.result?.toString().split(',')[1];
        
        console.log('Processing medication image...');
        
        // Call OCR edge function
        const { data, error } = await supabase.functions.invoke('extract-medication', {
          body: { image: base64Image }
        });

        if (error) {
          console.error('OCR error:', error);
          throw error;
        }

        console.log('Extracted medications:', data);

        if (data.medications && data.medications.length > 0) {
          toast({
            title: "Medications Extracted!",
            description: `Found ${data.medications.length} medication(s). They will be added to your list.`,
          });

          // Here you would typically save to a database
          // For now, just show success
          setIsOpen(false);
          setImagePreview(null);
        } else {
          toast({
            title: "No Medications Found",
            description: "Could not extract medication information from the image.",
            variant: "destructive",
          });
        }
      };
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1">
          <Camera className="w-4 h-4 mr-2" />
          Upload Photo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Medication Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Medication preview" 
                className="w-full rounded-lg border"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={clearImage}
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload a photo of your medication label or prescription
              </p>
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>
                    <Camera className="w-4 h-4 mr-2" />
                    Choose Photo
                  </span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isProcessing}
                />
              </label>
            </div>
          )}

          {isProcessing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Extracting medication information...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};