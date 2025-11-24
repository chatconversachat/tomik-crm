-- Drop the previous policies that might not be working correctly
DROP POLICY IF EXISTS "Anyone can create a tenant during signup" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can create tenants" ON public.tenants;

-- Create a security definer function to handle tenant creation
CREATE OR REPLACE FUNCTION public.create_tenant_for_signup(_name text, _slug text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant_id uuid;
BEGIN
  INSERT INTO public.tenants (name, slug)
  VALUES (_name, _slug)
  RETURNING id INTO _tenant_id;
  
  RETURN _tenant_id;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.create_tenant_for_signup TO anon;
GRANT EXECUTE ON FUNCTION public.create_tenant_for_signup TO authenticated;