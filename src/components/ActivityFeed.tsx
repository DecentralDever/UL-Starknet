import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Users, DollarSign, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ActivityItem {
  id: string;
  poolId: string;
  userId: string | null;
  activityType: string;
  title: string;
  description: string;
  metadata: any;
  createdAt: string;
}

interface ActivityFeedProps {
  poolId?: string;
  limit?: number;
}

export function ActivityFeed({ poolId, limit = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();

    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: poolId ? `pool_id=eq.${poolId}` : undefined,
        },
        (payload) => {
          const newActivity: ActivityItem = {
            id: payload.new.id,
            poolId: payload.new.pool_id,
            userId: payload.new.user_id,
            activityType: payload.new.activity_type,
            title: payload.new.title,
            description: payload.new.description,
            metadata: payload.new.metadata,
            createdAt: payload.new.created_at,
          };
          setActivities((prev) => [newActivity, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poolId, limit]);

  const loadActivities = async () => {
    try {
      let query = supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (poolId) {
        query = query.eq('pool_id', poolId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const items: ActivityItem[] = (data || []).map((row) => ({
        id: row.id,
        poolId: row.pool_id,
        userId: row.user_id,
        activityType: row.activity_type,
        title: row.title,
        description: row.description,
        metadata: row.metadata,
        createdAt: row.created_at,
      }));

      setActivities(items);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'POOL_CREATED':
        return <Users className="text-blue-600" size={20} />;
      case 'MEMBER_JOINED':
        return <UserPlus className="text-green-600" size={20} />;
      case 'CONTRIBUTION_MADE':
        return <DollarSign className="text-teal-600" size={20} />;
      case 'PAYOUT_RECEIVED':
        return <TrendingUp className="text-cyan-600" size={20} />;
      case 'POOL_COMPLETED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'DISPUTE_RAISED':
        return <AlertTriangle className="text-orange-600" size={20} />;
      case 'LATE_CONTRIBUTION':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      case 'DEFAULT_OCCURRED':
        return <AlertTriangle className="text-red-600" size={20} />;
      default:
        return <Activity className="text-gray-600" size={20} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'POOL_CREATED':
      case 'MEMBER_JOINED':
        return 'bg-blue-50 border-blue-200';
      case 'CONTRIBUTION_MADE':
      case 'PAYOUT_RECEIVED':
        return 'bg-teal-50 border-teal-200';
      case 'POOL_COMPLETED':
        return 'bg-green-50 border-green-200';
      case 'DISPUTE_RAISED':
      case 'LATE_CONTRIBUTION':
        return 'bg-yellow-50 border-yellow-200';
      case 'DEFAULT_OCCURRED':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return past.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity size={24} className="text-blue-600" />
          <h3 className="text-xl font-black text-gray-900">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <Activity size={20} className="text-white" />
        </div>
        <h3 className="text-xl font-black text-gray-900">Recent Activity</h3>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <Activity size={40} className="mx-auto mb-3 text-gray-400" />
          <p className="font-medium">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${getActivityColor(activity.activityType)}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 mb-1">{activity.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 font-medium">{formatTimeAgo(activity.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
