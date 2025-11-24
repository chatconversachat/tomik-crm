-- Allow anyone to insert new tenants during signup
CREATE POLICY "Anyone can create a tenant during signup"
ON public.tenants
FOR INSERT
TO anon
WITH CHECK (true);

-- Also allow authenticated users to create tenants
CREATE POLICY "Authenticated users can create tenants"
ON public.tenants
FOR INSERT
TO authenticated
WITH CHECK (true);