import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReputationUpdate {
  userId: string;
  eventType: 'POOL_COMPLETED' | 'LATE_CONTRIBUTION' | 'DEFAULT' | 'EARLY_CONTRIBUTION' | 'MANUAL_ADJUSTMENT';
  poolId?: string;
  notes?: string;
  manualScore?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, eventType, poolId, notes, manualScore }: ReputationUpdate = await req.json();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('reputation_score, completed_pools, late_count, default_count')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    let scoreChange = 0;
    let updateData: any = {};

    switch (eventType) {
      case 'POOL_COMPLETED':
        scoreChange = 50;
        updateData.completed_pools = user.completed_pools + 1;
        break;

      case 'EARLY_CONTRIBUTION':
        scoreChange = 5;
        break;

      case 'LATE_CONTRIBUTION':
        scoreChange = -20;
        updateData.late_count = user.late_count + 1;
        break;

      case 'DEFAULT':
        scoreChange = -100;
        updateData.default_count = user.default_count + 1;
        break;

      case 'MANUAL_ADJUSTMENT':
        scoreChange = manualScore || 0;
        break;

      default:
        throw new Error('Invalid event type');
    }

    const newScore = Math.max(0, Math.min(1000, user.reputation_score + scoreChange));
    updateData.reputation_score = newScore;

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    const { error: eventError } = await supabase
      .from('reputation_events')
      .insert({
        user_id: userId,
        pool_id: poolId,
        event_type: eventType,
        score_change: scoreChange,
        notes: notes || `${eventType} event`,
      });

    if (eventError) {
      console.error('Error creating reputation event:', eventError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        oldScore: user.reputation_score,
        newScore,
        scoreChange,
        eventType,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error updating reputation:", error);
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
