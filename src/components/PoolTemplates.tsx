import { Calendar, Umbrella, Plane, Home, Users, DollarSign } from 'lucide-react';

export interface PoolTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  defaultSettings: {
    size: number;
    contributionAmount: string;
    cadence: 'weekly' | 'monthly';
    payoutMode: 'fixed' | 'random';
    stakeEnabled: boolean;
    defaultFundEnabled: boolean;
  };
}

export const poolTemplates: PoolTemplate[] = [
  {
    id: 'monthly-bills',
    name: 'Monthly Bills',
    description: 'Rotating monthly bill payments with your trusted circle',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-600',
    defaultSettings: {
      size: 5,
      contributionAmount: '200',
      cadence: 'monthly',
      payoutMode: 'fixed',
      stakeEnabled: false,
      defaultFundEnabled: true,
    },
  },
  {
    id: 'emergency-fund',
    name: 'Emergency Fund',
    description: 'Build a safety net with consistent weekly contributions',
    icon: Umbrella,
    color: 'from-orange-500 to-red-600',
    defaultSettings: {
      size: 8,
      contributionAmount: '50',
      cadence: 'weekly',
      payoutMode: 'random',
      stakeEnabled: true,
      defaultFundEnabled: true,
    },
  },
  {
    id: 'vacation-savings',
    name: 'Vacation Savings',
    description: 'Save together for dream vacations or travel expenses',
    icon: Plane,
    color: 'from-teal-500 to-green-600',
    defaultSettings: {
      size: 6,
      contributionAmount: '150',
      cadence: 'monthly',
      payoutMode: 'random',
      stakeEnabled: true,
      defaultFundEnabled: false,
    },
  },
  {
    id: 'home-improvement',
    name: 'Home Improvement',
    description: 'Fund renovations, repairs, or household upgrades',
    icon: Home,
    color: 'from-amber-500 to-yellow-600',
    defaultSettings: {
      size: 5,
      contributionAmount: '300',
      cadence: 'monthly',
      payoutMode: 'fixed',
      stakeEnabled: true,
      defaultFundEnabled: true,
    },
  },
  {
    id: 'custom',
    name: 'Custom Circle',
    description: 'Create your own circle with custom settings',
    icon: Users,
    color: 'from-gray-600 to-gray-800',
    defaultSettings: {
      size: 5,
      contributionAmount: '100',
      cadence: 'weekly',
      payoutMode: 'fixed',
      stakeEnabled: false,
      defaultFundEnabled: false,
    },
  },
];

interface PoolTemplatesProps {
  onSelectTemplate: (template: PoolTemplate) => void;
}

export function PoolTemplates({ onSelectTemplate }: PoolTemplatesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {poolTemplates.map((template) => {
        const Icon = template.icon;
        return (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="text-left p-6 rounded-2xl border-2 border-gray-200 hover:border-teal-500 transition-all hover:shadow-lg group"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-700 font-medium">
                    <Users size={12} className="inline mr-1" />
                    {template.defaultSettings.size} members
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-700 font-medium">
                    <DollarSign size={12} className="inline mr-1" />
                    ${template.defaultSettings.contributionAmount}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-700 font-medium capitalize">
                    {template.defaultSettings.cadence}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
