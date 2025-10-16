import { ArrowLeft, HelpCircle, Book, Shield, DollarSign, Users, AlertCircle } from 'lucide-react';

export function HelpPage({ onBack }: { onBack: () => void }) {
  const sections = [
    {
      icon: Book,
      title: 'Getting Started',
      items: [
        {
          q: 'What is UnityLedger?',
          a: 'UnityLedger is a decentralized savings circle platform (ROSCA) built on Starknet blockchain. It allows groups to pool funds together and take turns receiving payouts, all secured by smart contracts.',
        },
        {
          q: 'How do I create an account?',
          a: 'Simply sign in with your email. A secure Starknet wallet will be automatically generated for you. You\'ll create a PIN to encrypt your wallet - keep this safe!',
        },
        {
          q: 'Do I need cryptocurrency experience?',
          a: 'No! UnityLedger is designed for everyone. We handle all the blockchain complexity behind the scenes. You just need USDC stablecoin to participate.',
        },
      ],
    },
    {
      icon: Users,
      title: 'Savings Circles',
      items: [
        {
          q: 'How do savings circles work?',
          a: 'Members contribute a fixed amount each cycle (weekly or monthly). After all contributions are in, one member receives the full pool. This repeats until everyone has received a payout.',
        },
        {
          q: 'How do I join a circle?',
          a: 'Browse available circles on your dashboard, click to view details, and join with your PIN. You\'ll be assigned a payout position automatically.',
        },
        {
          q: 'Can I create my own circle?',
          a: 'Yes! Click "Create Circle" and set your parameters: size, contribution amount, cadence, and payout mode (fixed order or random).',
        },
      ],
    },
    {
      icon: DollarSign,
      title: 'Contributions & Payouts',
      items: [
        {
          q: 'When do I need to contribute?',
          a: 'Contributions are due each cycle based on the circle\'s cadence. You\'ll receive notifications reminding you before the deadline.',
        },
        {
          q: 'What happens if I miss a contribution?',
          a: 'Late contributions affect your reputation score. If default fund is enabled, it may cover missed payments. Multiple defaults can result in removal from the circle.',
        },
        {
          q: 'When do I receive my payout?',
          a: 'You\'ll receive your payout when it\'s your turn based on your position. The pool creator triggers payouts after all members contribute for that cycle.',
        },
      ],
    },
    {
      icon: Shield,
      title: 'Security & Reputation',
      items: [
        {
          q: 'How is my wallet secured?',
          a: 'Your private key is encrypted with your PIN and stored securely. Only you can access it. We never have access to your funds.',
        },
        {
          q: 'What is reputation score?',
          a: 'Your reputation (0-1000) reflects your reliability. It increases with completed circles and on-time payments, decreases with late or missed contributions. Higher reputation unlocks better opportunities.',
        },
        {
          q: 'What if there\'s a dispute?',
          a: 'Use the "Report Issue" button in any circle you\'re part of. Our team reviews all disputes and takes appropriate action to protect members.',
        },
      ],
    },
    {
      icon: AlertCircle,
      title: 'Troubleshooting',
      items: [
        {
          q: 'I forgot my PIN',
          a: 'Unfortunately, your PIN cannot be recovered as it encrypts your wallet. This ensures maximum security. You\'ll need to create a new account.',
        },
        {
          q: 'My transaction is stuck',
          a: 'Blockchain transactions can take a few minutes. If it\'s been over 10 minutes, check the transaction on Voyager explorer using the tx hash.',
        },
        {
          q: 'Where do I get USDC?',
          a: 'You can obtain USDC testnet tokens from faucets or bridge from other networks. For mainnet, you can purchase USDC on exchanges and transfer to your wallet.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-emerald-50/30">
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium hover:gap-3"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl mb-4">
            <HelpCircle size={32} className="text-teal-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Help Center</h1>
          <p className="text-gray-600">Everything you need to know about UnityLedger</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <section.icon size={24} className="text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>

              <div className="space-y-6">
                {section.items.map((item, iIdx) => (
                  <div key={iIdx}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.q}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-teal-100 mb-6">
            Our support team is here to help. Reach out to us at support@unityledger.com or join our
            community Discord for real-time assistance.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-white text-teal-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold">
              Contact Support
            </button>
            <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors font-semibold">
              Join Discord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
