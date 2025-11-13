import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Module {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  route: string | null;
  active: boolean;
}

interface TenantModule {
  id: string;
  tenant_id: string;
  module_id: string;
  active: boolean;
  module: Module;
}

export const useTenantModules = () => {
  const { tenant, loading: authLoading } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !tenant) {
      setLoading(false);
      return;
    }

    const fetchTenantModules = async () => {
      try {
        const { data, error } = await supabase
          .from('tenant_modules')
          .select(`
            *,
            module:modules(*)
          `)
          .eq('tenant_id', tenant.id)
          .eq('active', true);

        if (error) throw error;

        const activeModules = data
          .filter((tm: TenantModule) => tm.module.active)
          .map((tm: TenantModule) => tm.module);

        setModules(activeModules);
      } catch (error) {
        console.error('Error fetching tenant modules:', error);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantModules();
  }, [tenant, authLoading]);

  const hasModule = (moduleName: string) => {
    return modules.some(m => m.name === moduleName);
  };

  return { modules, loading, hasModule };
};