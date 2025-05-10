
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload } from 'lucide-react';
import { ExerciseFormData } from '@/hooks/useAdminExercises';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  video_url: z.string().optional().nullable(),
});

interface ExerciseFormProps {
  onSubmit: (data: ExerciseFormData) => void;
  isLoading: boolean;
  categories: Database['public']['Tables']['workout_categories']['Row'][];
  initialData?: {
    name: string;
    description?: string | null;
    category_id?: string | null;
    image_url?: string | null;
    video_url?: string | null;
  };
}

const ExerciseForm = ({ onSubmit, isLoading, categories, initialData }: ExerciseFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [gifPreview, setGifPreview] = useState<string | null>(initialData?.image_url || null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category_id: initialData?.category_id || null,
      image_url: initialData?.image_url || "",
      video_url: initialData?.video_url || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as ExerciseFormData);
  };

  const handleGifUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.includes('gif') && !file.type.includes('image')) {
      toast.error("Please upload a GIF or image file");
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `exercises/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('exercises')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exercises')
        .getPublicUrl(filePath);
      
      // Update form
      form.setValue('image_url', publicUrl);
      setGifPreview(publicUrl);
      toast.success("GIF uploaded successfully");
      
    } catch (error) {
      console.error('Error uploading GIF:', error);
      toast.error("Failed to upload GIF");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter exercise name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter exercise description" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise GIF/Image</FormLabel>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <FormControl>
                    <Input 
                      type="text"
                      placeholder="https://example.com/image.gif" 
                      {...field}
                      value={field.value || ""}
                      className={isUploading ? "opacity-50" : ""}
                    />
                  </FormControl>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/gif,image/*"
                      id="gif-upload"
                      onChange={handleGifUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload GIF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {gifPreview && (
                  <div className="border rounded-md p-2 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <img 
                      src={gifPreview} 
                      alt="Exercise preview" 
                      className="max-h-40 object-contain mx-auto"
                    />
                  </div>
                )}
                
                <FormDescription>
                  Upload a GIF demonstrating the exercise or enter a URL
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/video.mp4" 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Enter a URL for an instructional video
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading || isUploading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            initialData ? 'Update Exercise' : 'Create Exercise'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ExerciseForm;
