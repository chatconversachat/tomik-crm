-- Create tenants table (empresas/clientes)
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'suspended', 'cancelled')),
  settings jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create modules table (global - shared across all tenants)
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  icon text,
  route text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  active boolean DEFAULT true NOT NULL
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Create plans table (global - shared across all tenants)
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  price_monthly numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  active boolean DEFAULT true NOT NULL
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Create plan_modules junction table (which modules are included in each plan)
CREATE TABLE public.plan_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(plan_id, module_id)
);

ALTER TABLE public.plan_modules ENABLE ROW LEVEL SECURITY;

-- Create tenant_modules table (which modules each tenant has active)
CREATE TABLE public.tenant_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  active boolean DEFAULT true NOT NULL,
  activated_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone,
  UNIQUE(tenant_id, module_id)
);

ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;

-- Create profiles table with tenant association
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table with tenant isolation
CREATE TYPE public.app_role AS ENUM ('tenant_admin', 'tenant_user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, tenant_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add tenant_id to existing tables
ALTER TABLE public.config_fiscal ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.contas_pagar ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.contas_receber ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.fluxo_caixa ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.notas_fiscais ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.regras_fiscais ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Create security definer function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Create security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to check if tenant has module access
CREATE OR REPLACE FUNCTION public.tenant_has_module(_tenant_id uuid, _module_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_modules tm
    JOIN public.modules m ON m.id = tm.module_id
    WHERE tm.tenant_id = _tenant_id
      AND m.name = _module_name
      AND tm.active = true
      AND (tm.expires_at IS NULL OR tm.expires_at > now())
  )
$$;

-- RLS Policies for tenants table
CREATE POLICY "Users can view their own tenant"
  ON public.tenants FOR SELECT
  USING (id = public.get_user_tenant_id());

CREATE POLICY "Tenant admins can update their tenant"
  ON public.tenants FOR UPDATE
  USING (id = public.get_user_tenant_id() AND public.has_role(auth.uid(), 'tenant_admin'));

-- RLS Policies for profiles table
CREATE POLICY "Users can view profiles in their tenant"
  ON public.profiles FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- RLS Policies for modules (global - everyone can view)
CREATE POLICY "Anyone can view active modules"
  ON public.modules FOR SELECT
  USING (active = true);

-- RLS Policies for plans (global - everyone can view)
CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (active = true);

-- RLS Policies for tenant_modules
CREATE POLICY "Users can view their tenant's modules"
  ON public.tenant_modules FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant admins can manage their tenant's modules"
  ON public.tenant_modules FOR ALL
  USING (tenant_id = public.get_user_tenant_id() AND public.has_role(auth.uid(), 'tenant_admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their tenant"
  ON public.user_roles FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant admins can manage roles in their tenant"
  ON public.user_roles FOR ALL
  USING (tenant_id = public.get_user_tenant_id() AND public.has_role(auth.uid(), 'tenant_admin'));

-- Update RLS policies for existing tables with tenant isolation
DROP POLICY IF EXISTS "Allow all operations on config_fiscal" ON public.config_fiscal;
CREATE POLICY "Users can manage config_fiscal in their tenant"
  ON public.config_fiscal FOR ALL
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Allow all operations on contas_pagar" ON public.contas_pagar;
CREATE POLICY "Users can manage contas_pagar in their tenant"
  ON public.contas_pagar FOR ALL
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Allow all operations on contas_receber" ON public.contas_receber;
CREATE POLICY "Users can manage contas_receber in their tenant"
  ON public.contas_receber FOR ALL
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Allow all operations on fluxo_caixa" ON public.fluxo_caixa;
CREATE POLICY "Users can manage fluxo_caixa in their tenant"
  ON public.fluxo_caixa FOR ALL
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Allow all operations on notas_fiscais" ON public.notas_fiscais;
CREATE POLICY "Users can manage notas_fiscais in their tenant"
  ON public.notas_fiscais FOR ALL
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Allow all operations on regras_fiscais" ON public.regras_fiscais;
CREATE POLICY "Users can manage regras_fiscais in their tenant"
  ON public.regras_fiscais FOR ALL
  USING (tenant_id = public.get_user_tenant_id());

-- Trigger to update updated_at on tenants
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default modules
INSERT INTO public.modules (name, display_name, description, icon, route) VALUES
  ('crm', 'CRM', 'Gestão de Leads e Pipeline de Vendas', 'Users', '/crm'),
  ('agendamentos', 'Agendamentos', 'Gestão de Agendamentos e Calendário', 'Calendar', '/agendamentos'),
  ('produtos', 'Produtos', 'Catálogo de Produtos e Serviços', 'Package', '/produtos'),
  ('financeiro', 'Financeiro', 'Fluxo de Caixa e Relatórios Financeiros', 'DollarSign', '/financeiro'),
  ('whatsapp', 'WhatsApp', 'Integração WhatsApp e IA', 'MessageSquare', '/whatsapp'),
  ('fiscal', 'Fiscal', 'Emissão de Notas Fiscais', 'FileText', '/fiscal'),
  ('agentes', 'Agentes IA', 'Agentes de Inteligência Artificial', 'Bot', '/agentes'),
  ('relatorios', 'Relatórios', 'Relatórios e Análises', 'BarChart', '/relatorios');

-- Insert default plans
INSERT INTO public.plans (name, display_name, description, price_monthly) VALUES
  ('basic', 'Básico', 'Plano básico com módulos essenciais', 99.90),
  ('professional', 'Profissional', 'Plano completo para empresas em crescimento', 299.90),
  ('enterprise', 'Enterprise', 'Plano completo com todos os módulos', 599.90);

-- Associate modules to plans
INSERT INTO public.plan_modules (plan_id, module_id)
SELECT p.id, m.id FROM public.plans p, public.modules m
WHERE p.name = 'basic' AND m.name IN ('crm', 'agendamentos', 'produtos');

INSERT INTO public.plan_modules (plan_id, module_id)
SELECT p.id, m.id FROM public.plans p, public.modules m
WHERE p.name = 'professional' AND m.name IN ('crm', 'agendamentos', 'produtos', 'financeiro', 'whatsapp');

INSERT INTO public.plan_modules (plan_id, module_id)
SELECT p.id, m.id FROM public.plans p, public.modules m
WHERE p.name = 'enterprise';

-- Function to handle new user signup (creates profile with tenant)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant_id uuid;
BEGIN
  -- Get tenant_id from user metadata (set during signup)
  _tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::uuid;
  
  -- Insert profile
  INSERT INTO public.profiles (id, tenant_id, email, full_name)
  VALUES (
    NEW.id,
    _tenant_id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();