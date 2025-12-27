-- Add deleted_at column to products table
ALTER TABLE public.products
ADD COLUMN deleted_at TIMESTAMPTZ;

-- Create index for soft deletes
CREATE INDEX idx_products_deleted_at ON public.products(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Add image column (renaming from image_url for consistency)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image TEXT;

-- Update the trigger function to set deleted_at when status changes to 'Deleted'
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Set deleted_at when status changes to 'Deleted'
  IF NEW.status = 'Deleted' AND OLD.status != 'Deleted' THEN
    NEW.deleted_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS products_updated_at_trigger ON public.products;
CREATE TRIGGER products_updated_at_trigger
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Users can update their product images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their product images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );
