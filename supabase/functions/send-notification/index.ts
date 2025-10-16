import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  userId: string;
  type: 'contribution_reminder' | 'payout_ready' | 'pool_full' | 'late_payment' | 'default_warning';
  poolId: string;
  poolName: string;
  metadata?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userId, type, poolId, poolName, metadata }: NotificationRequest = await req.json();

    const templates = {
      contribution_reminder: {
        subject: `Contribution Due: ${poolName}`,
        message: `Your contribution for ${poolName} is due soon. Please contribute ${metadata?.amount} USDC by ${metadata?.dueDate}.`,
      },
      payout_ready: {
        subject: `Payout Available: ${poolName}`,
        message: `Great news! Your payout of ${metadata?.amount} USDC is ready in ${poolName}.`,
      },
      pool_full: {
        subject: `Pool Full: ${poolName}`,
        message: `${poolName} is now full! The first cycle will start on ${metadata?.startDate}.`,
      },
      late_payment: {
        subject: `Late Payment Warning: ${poolName}`,
        message: `You have missed the contribution deadline for ${poolName}. Please contribute as soon as possible to avoid penalties.`,
      },
      default_warning: {
        subject: `Default Risk: ${poolName}`,
        message: `Warning: You are at risk of defaulting on ${poolName}. This will affect your reputation score. Please contribute immediately.`,
      },
    };

    const template = templates[type];

    console.log(`Notification sent to user ${userId}:`, {
      type,
      poolId,
      subject: template.subject,
      message: template.message,
    });

    return new Response(
      JSON.stringify({
        success: true,
        notification: {
          userId,
          type,
          poolId,
          subject: template.subject,
          message: template.message,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
