import { useState } from 'react';
import { X, Calendar, Users, DollarSign, Clock, ArrowLeft } from 'lucide-react';
import { usePools } from '../hooks/usePools';
import { PoolTemplates, PoolTemplate } from './PoolTemplates';

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePoolModal({ isOpen, onClose }: CreatePoolModalProps) {
  const { createPool } = usePools();
  const [step, setStep] = useState<'template' | 'form'>('template');
  const [formData, setFormData] = useState({
    name: '',
    size: 5,
    contributionAmount: '100',
    cadence: 'weekly',
    startDate: '',
    payoutMode: 'fixed' as 'fixed' | 'random',
    stakeEnabled: false,
    defaultFundEnabled: false,
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTemplateSelect = (template: PoolTemplate) => {
    setFormData({
      name: template.id === 'custom' ? '' : template.name,
      size: template.defaultSettings.size,
      contributionAmount: template.defaultSettings.contributionAmount,
      cadence: template.defaultSettings.cadence,
      startDate: '',
      payoutMode: template.defaultSettings.payoutMode,
      stakeEnabled: template.defaultSettings.stakeEnabled,
      defaultFundEnabled: template.defaultSettings.defaultFundEnabled,
    });
    setStep('form');
  };

  const handleClose = () => {
    setStep('template');
    setFormData({
      name: '',
      size: 5,
      contributionAmount: '100',
      cadence: 'weekly',
      startDate: '',
      payoutMode: 'fixed',
      stakeEnabled: false,
      defaultFundEnabled: false,
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cadenceSeconds = formData.cadence === 'weekly' ? 604800 : 2592000;
      const contributionWei = (parseFloat(formData.contributionAmount) * 1e6).toString();

      await createPool({
        name: formData.name,
        size: formData.size,
        contributionAmount: contributionWei,
        cadenceSeconds,
        payoutMode: formData.payoutMode,
        startDate: new Date(formData.startDate).toISOString(),
        stakeEnabled: formData.stakeEnabled,
        defaultFundEnabled: formData.defaultFundEnabled,
      });

      handleClose();
    } catch (error: any) {
      console.error('Error creating pool:', error);
      const errorMsg = error.message || 'Unknown error';
      alert('Failed to create pool: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            {step === 'form' && (
              <button
                onClick={() => setStep('template')}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {step === 'template' ? 'Choose a Template' : 'Create Savings Pool'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {step === 'template' ? (
          <div className="p-4 sm:p-6">
            <p className="text-gray-600 mb-6">Select a pre-configured template to get started quickly, or create a custom circle.</p>
            <PoolTemplates onSelectTemplate={handleTemplateSelect} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pool Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Friends Savings Circle"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users size={18} />
                Pool Size
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={18} />
                Contribution (USDC)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={formData.contributionAmount}
                onChange={(e) => setFormData({ ...formData, contributionAmount: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={18} />
                Frequency
              </label>
              <select
                value={formData.cadence}
                onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
                className="input-field"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={18} />
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payout Order
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payoutMode: 'fixed' })}
                className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                  formData.payoutMode === 'fixed'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Fixed Order
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payoutMode: 'random' })}
                className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                  formData.payoutMode === 'random'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Random Order
              </button>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.stakeEnabled}
                onChange={(e) => setFormData({ ...formData, stakeEnabled: e.target.checked })}
                className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
              />
              <div>
                <div className="font-medium text-gray-900">Enable Yield Staking</div>
                <div className="text-sm text-gray-600">Earn yield on pooled funds between payouts</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.defaultFundEnabled}
                onChange={(e) => setFormData({ ...formData, defaultFundEnabled: e.target.checked })}
                className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
              />
              <div>
                <div className="font-medium text-gray-900">Default Protection</div>
                <div className="text-sm text-gray-600">Cover missed payments with insurance fund</div>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Pool'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
