import { useState } from 'react';
import { X, Copy, CheckCircle, Share2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolId: string;
  poolName: string;
}

export function InviteModal({ isOpen, onClose, poolId, poolName }: InviteModalProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteLink = `${window.location.origin}/?join=${poolId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      showToast('Invite link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${poolName} on UnityLedger`,
          text: `You're invited to join "${poolName}" savings circle on UnityLedger!`,
          url: inviteLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Share2 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Invite Members</h3>
              <p className="text-sm text-gray-600">{poolName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Share this link with people you want to invite
          </label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-mono break-all">
              {inviteLink}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <CheckCircle size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <LinkIcon className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-teal-900">
              <p className="font-semibold mb-1">How it works</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Share this link with trusted friends and family</li>
                <li>They'll be directed to join your savings circle</li>
                <li>Pool activates when all members have joined</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          {navigator.share && (
            <button
              onClick={handleShare}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
