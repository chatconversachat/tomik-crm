// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { instanceId, evolutionApiUrl, evolutionApiKey, action } = await req.json();

    if (!instanceId || !evolutionApiUrl || !evolutionApiKey || !action) {
      throw new Error("instanceId, evolutionApiUrl, evolutionApiKey e action são obrigatórios.");
    }

    let responseData;
    let instanceStatus = "disconnected";
    let qrCodeData = null;
    let sessionData = null;

    if (action === "connect") {
      // 1. Criar/Iniciar instância na Evolution API
      const startInstanceResponse = await fetch(`${evolutionApiUrl}/instance/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": evolutionApiKey,
        },
        body: JSON.stringify({ instanceName: `instance-${instanceId}` }),
      });

      if (!startInstanceResponse.ok) {
        const errorBody = await startInstanceResponse.json();
        throw new Error(`Evolution API start error: ${errorBody.message || startInstanceResponse.statusText}`);
      }

      const startInstanceResult = await startInstanceResponse.json();
      console.log("Evolution API start instance result:", startInstanceResult);

      // 2. Obter QR Code
      const qrCodeResponse = await fetch(`${evolutionApiUrl}/instance/qrcode?instanceName=instance-${instanceId}`, {
        method: "GET",
        headers: {
          "apikey": evolutionApiKey,
        },
      });

      if (!qrCodeResponse.ok) {
        const errorBody = await qrCodeResponse.json();
        throw new Error(`Evolution API QR code error: ${errorBody.message || qrCodeResponse.statusText}`);
      }

      const qrCodeResult = await qrCodeResponse.json();
      console.log("Evolution API QR code result:", qrCodeResult);

      if (qrCodeResult.qrcode) {
        qrCodeData = qrCodeResult.qrcode; // Base64 image
        instanceStatus = "qr_pending";
      } else {
        throw new Error("QR Code não recebido da Evolution API.");
      }

      responseData = { qrCode: qrCodeData, status: instanceStatus };
    } else if (action === "disconnect") {
      // Desconectar/Fechar instância na Evolution API
      const logoutInstanceResponse = await fetch(`${evolutionApiUrl}/instance/logout?instanceName=instance-${instanceId}`, {
        method: "DELETE",
        headers: {
          "apikey": evolutionApiKey,
        },
      });

      if (!logoutInstanceResponse.ok) {
        const errorBody = await logoutInstanceResponse.json();
        throw new Error(`Evolution API logout error: ${errorBody.message || logoutInstanceResponse.statusText}`);
      }

      instanceStatus = "disconnected";
      qrCodeData = null;
      sessionData = null;
      responseData = { status: instanceStatus };
    } else if (action === "check_status") {
      // Verificar status da instância na Evolution API
      const statusResponse = await fetch(`${evolutionApiUrl}/instance/connectionState?instanceName=instance-${instanceId}`, {
        method: "GET",
        headers: {
          "apikey": evolutionApiKey,
        },
      });

      if (!statusResponse.ok) {
        const errorBody = await statusResponse.json();
        throw new Error(`Evolution API status check error: ${errorBody.message || statusResponse.statusText}`);
      }

      const statusResult = await statusResponse.json();
      console.log("Evolution API status check result:", statusResult);

      if (statusResult.state === "connected") {
        instanceStatus = "connected";
        sessionData = statusResult; // Store relevant session data
      } else if (statusResult.state === "qr_pending" || statusResult.state === "loading") {
        instanceStatus = "qr_pending"; // Still waiting for QR scan
        // Optionally fetch QR again if needed, but for now assume it's already displayed
      } else {
        instanceStatus = "disconnected";
      }
      responseData = { status: instanceStatus, sessionData: sessionData };
    }

    // Atualizar status da instância no Supabase
    const { error: updateError } = await supabase
      .from("whatsapp_instances")
      .update({
        status: instanceStatus,
        qr_code_data: qrCodeData,
        session_data: sessionData,
        evolution_api_url: evolutionApiUrl,
        evolution_api_key: evolutionApiKey,
      })
      .eq("id", instanceId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ sucesso: true, ...responseData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Erro na função Evolution API Connect:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({
        sucesso: false,
        erro: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});