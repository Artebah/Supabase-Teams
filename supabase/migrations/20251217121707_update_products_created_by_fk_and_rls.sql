-- Drop the existing foreign key constraint
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_created_by_fkey;

-- Add new foreign key constraint pointing to profiles instead of auth.users
ALTER TABLE public.products
ADD CONSTRAINT products_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Drop old RLS policies from initial schema
DROP POLICY IF EXISTS "Users can view products from their team" ON public.products;
DROP POLICY IF EXISTS "Users can insert products for their team" ON public.products;
DROP POLICY IF EXISTS "Users can update Draft products they created" ON public.products;
DROP POLICY IF EXISTS "Users can change status of products in their team" ON public.products;

-- Drop any other existing policies (in case of conflicts)
DROP POLICY IF EXISTS "Users can view products in their team" ON public.products;
DROP POLICY IF EXISTS "Users can create products in their team" ON public.products;
DROP POLICY IF EXISTS "Users can update products in their team" ON public.products;
DROP POLICY IF EXISTS "Users can delete products in their team" ON public.products;

-- Create new RLS policies that work with profiles
CREATE POLICY "Users can view products in their team"
  ON public.products
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create products in their team"
  ON public.products
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update products in their team"
  ON public.products
  FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT team_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete products in their team"
  ON public.products
  FOR DELETE
  USING (
    team_id IN (
      SELECT team_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );