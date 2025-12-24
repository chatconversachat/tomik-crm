-- Create notifications table for the notification center
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, error, approval
  category TEXT NOT NULL DEFAULT 'system', -- system, financial, purchase, construction, contract
  priority TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
  status TEXT NOT NULL DEFAULT 'unread', -- unread, read, archived
  action_url TEXT,
  action_label TEXT,
  related_entity_type TEXT, -- contas_pagar, contas_receber, obras, etc
  related_entity_id UUID,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only see their own tenant's notifications
CREATE POLICY "Users can view their tenant notifications" 
ON public.notifications 
FOR SELECT 
USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their tenant notifications" 
ON public.notifications 
FOR UPDATE 
USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create index for performance
CREATE INDEX idx_notifications_tenant_status ON public.notifications(tenant_id, status);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create function to generate system notifications for financial due dates
CREATE OR REPLACE FUNCTION public.check_financial_due_dates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conta RECORD;
BEGIN
  -- Check contas_pagar due in next 3 days
  FOR conta IN 
    SELECT cp.*, t.id as tid
    FROM contas_pagar cp
    JOIN tenants t ON cp.tenant_id = t.id
    WHERE cp.status = 'pendente'
    AND cp.data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.related_entity_type = 'contas_pagar' 
      AND n.related_entity_id = cp.id 
      AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
    )
  LOOP
    INSERT INTO notifications (tenant_id, title, message, type, category, priority, related_entity_type, related_entity_id, action_url)
    VALUES (
      conta.tenant_id,
      'Conta a pagar vencendo',
      'A conta "' || conta.descricao || '" vence em ' || (conta.data_vencimento - CURRENT_DATE) || ' dia(s). Valor: R$ ' || conta.valor,
      'warning',
      'financial',
      CASE WHEN conta.data_vencimento = CURRENT_DATE THEN 'urgent' ELSE 'high' END,
      'contas_pagar',
      conta.id,
      '/financeiro'
    );
  END LOOP;

  -- Check contas_receber due in next 3 days
  FOR conta IN 
    SELECT cr.*, t.id as tid
    FROM contas_receber cr
    JOIN tenants t ON cr.tenant_id = t.id
    WHERE cr.status = 'pendente'
    AND cr.data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.related_entity_type = 'contas_receber' 
      AND n.related_entity_id = cr.id 
      AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
    )
  LOOP
    INSERT INTO notifications (tenant_id, title, message, type, category, priority, related_entity_type, related_entity_id, action_url)
    VALUES (
      conta.tenant_id,
      'Conta a receber vencendo',
      'A conta "' || conta.descricao || '" vence em ' || (conta.data_vencimento - CURRENT_DATE) || ' dia(s). Valor: R$ ' || conta.valor,
      'info',
      'financial',
      'normal',
      'contas_receber',
      conta.id,
      '/financeiro'
    );
  END LOOP;
END;
$$;