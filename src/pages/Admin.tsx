import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Shield, Users } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'tenant_admin' | 'tenant_user' | null;
}

const Admin = () => {
  const { profile, tenant } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
  }, [tenant]);

  const checkAdminStatus = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (!error && data?.role === 'tenant_admin') {
      setIsAdmin(true);
    }
  };

  const fetchUsers = async () => {
    if (!tenant) return;

    try {
      // Fetch all profiles in tenant
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (profilesError) throw profilesError;

      // Fetch all roles for these users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = profiles?.map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.id)?.role || null,
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error('Erro ao carregar usuários');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'tenant_admin' | 'tenant_user') => {
    if (!tenant) return;

    try {
      // Check if role exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('tenant_id', tenant.id)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId)
          .eq('tenant_id', tenant.id);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            tenant_id: tenant.id,
            role: newRole,
          });

        if (error) throw error;
      }

      toast.success('Permissão atualizada com sucesso');
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro ao atualizar permissão');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administração</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões do {tenant?.name}
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {users.length} usuários
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários e Permissões</CardTitle>
          <CardDescription>
            Gerencie as permissões dos usuários da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'Sem nome'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role || 'tenant_user'}
                      onValueChange={(value) => 
                        handleRoleChange(user.id, value as 'tenant_admin' | 'tenant_user')
                      }
                      disabled={user.id === profile?.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenant_user">Usuário</SelectItem>
                        <SelectItem value="tenant_admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    {user.id === profile?.id && (
                      <p className="text-xs text-muted-foreground mt-1">
                        (você não pode alterar sua própria permissão)
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
