import { ArrowRight, Shield, Users, TrendingUp, Zap, Lock, Globe, CheckCircle, Star, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {

  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your funds are protected by Starknet blockchain technology and smart contract audits.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Community Powered',
      description: 'Join trusted savings circles with friends, family, or vetted community members.',
      gradient: 'from-cyan-500 to-teal-500',
    },
    {
      icon: TrendingUp,
      title: 'Earn While You Save',
      description: 'Optional staking generates yield on pooled funds, increasing your returns.',
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Instant Payouts',
      description: 'Automated smart contracts ensure timely, transparent payouts every cycle.',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Lock,
      title: 'Non-Custodial',
      description: 'You maintain full control of your wallet. We never hold your funds.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Save in USDC stablecoin. No banks, no borders, no barriers.',
      gradient: 'from-teal-500 to-cyan-500',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Wallet',
      description: 'Set up a secure Starknet wallet in seconds with just a PIN. No seed phrases needed.',
      icon: Shield,
    },
    {
      number: '02',
      title: 'Join or Create a Circle',
      description: 'Choose an existing savings circle or create your own with custom terms.',
      icon: Users,
    },
    {
      number: '03',
      title: 'Contribute Regularly',
      description: 'Make your scheduled USDC contributions each cycle. Never miss a payment.',
      icon: TrendingUp,
    },
    {
      number: '04',
      title: 'Receive Your Payout',
      description: 'Get your full payout when its your turn, plus any yield earned from staking.',
      icon: Sparkles,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Small Business Owner',
      content: 'UnityLedger helped me save $10,000 for my business expansion. The automated contributions kept me disciplined.',
      avatar: '👩‍💼',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      role: 'Freelance Designer',
      content: 'I love the transparency. Every transaction is on-chain and verifiable. No hidden fees or surprises.',
      avatar: '👨‍💻',
      rating: 5,
    },
    {
      name: 'Amina Okafor',
      role: 'Community Organizer',
      content: 'Our community of 20 members saved over $50,000 together. The trust system works perfectly.',
      avatar: '👩‍🔬',
      rating: 5,
    },
  ];

  const stats = [
    { value: '$2.5M+', label: 'Total Saved', icon: TrendingUp },
    { value: '5,000+', label: 'Active Members', icon: Users },
    { value: '850+', label: 'Savings Circles', icon: Globe },
    { value: '99.8%', label: 'Success Rate', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200/50 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src="/UL copy.png" alt="UnityLedger" className="h-8 w-8 sm:h-12 sm:w-12 animate-float" />
              <span className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                UnityLedger
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 lg:gap-8">
                <a href="#features" className="text-sm lg:text-base text-gray-600 hover:text-gray-900 font-semibold transition-all hover:scale-105">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm lg:text-base text-gray-600 hover:text-gray-900 font-semibold transition-all hover:scale-105">
                  How It Works
                </a>
                <a href="#testimonials" className="text-sm lg:text-base text-gray-600 hover:text-gray-900 font-semibold transition-all hover:scale-105">
                  Testimonials
                </a>
              </div>
              <button
                onClick={onGetStarted}
                className="btn-primary px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-24 px-4 sm:px-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 md:w-96 md:h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 md:w-96 md:h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-white rounded-full mb-4 sm:mb-8 shadow-lg border-2 border-blue-200">
                <Sparkles size={16} className="sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-blue-700 font-bold text-xs sm:text-sm">Powered by Starknet Blockchain</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-4 sm:mb-6 md:mb-8 leading-tight">
                Save Together,
                <br />
                <span className="gradient-text">
                  Grow Together
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 md:mb-10 leading-relaxed font-medium">
                Join the modern way to save. Create or join trusted savings circles, contribute regularly, and receive
                guaranteed payouts. All secured by blockchain technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                <button
                  onClick={onGetStarted}
                  className="group btn-primary px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl inline-flex items-center justify-center gap-2 sm:gap-3"
                >
                  Start Saving Now
                  <ArrowRight size={20} className="sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                </button>
                <button className="btn-secondary px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl">
                  Watch Demo
                </button>
              </div>
              <div className="mt-6 sm:mt-10 md:mt-14 grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-8 md:gap-12">
                {stats.slice(0, 2).map((stat, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg sm:rounded-xl flex-shrink-0">
                      <stat.icon size={18} className="sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900">{stat.value}</div>
                      <div className="text-xs sm:text-sm text-gray-600 font-semibold">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl md:rounded-3xl transform rotate-6 opacity-10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl md:rounded-3xl transform rotate-3 opacity-10"></div>
              <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-200">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 mb-2 font-semibold">Monthly Goal</div>
                      <div className="text-5xl font-black gradient-text">$5,000</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-lg">
                      <TrendingUp size={40} className="text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 h-full rounded-full shadow-lg transition-all duration-1000 animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                      <div className="text-sm text-blue-700 mb-2 font-bold">Contributed</div>
                      <div className="text-3xl font-black text-blue-900">$3,750</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border-2 border-teal-100">
                      <div className="text-sm text-teal-700 mb-2 font-bold">Remaining</div>
                      <div className="text-3xl font-black text-teal-900">$1,250</div>
                    </div>
                  </div>
                  <div className="pt-6 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-semibold">8 of 12 members contributed</span>
                      <span className="text-green-600 font-black flex items-center gap-2">
                        <CheckCircle size={20} />
                        On Track
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-4 border-2 border-blue-200">
              <Star size={18} className="text-blue-600 fill-blue-600" />
              <span className="text-blue-700 font-bold text-sm">Trusted by Thousands</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="card p-8 text-center group hover:scale-105">
                <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon size={32} className="text-blue-600" />
                </div>
                <div className="text-5xl font-black gradient-text mb-3">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-bold text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Why Choose UnityLedger?
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              Built for the modern saver with cutting-edge blockchain technology and user-friendly design.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card-interactive p-10 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              Get started in minutes with our simple, secure process.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 opacity-30"></div>
                )}
                <div className="relative">
                  <div className="text-8xl font-black text-blue-100 mb-6 group-hover:scale-110 transition-transform">{step.number}</div>
                  <div className="absolute top-10 left-0 w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <step.icon size={36} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 mt-10">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg font-medium">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Loved by Savers Worldwide
            </h2>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto font-medium">
              Join thousands of satisfied members achieving their financial goals.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="glass-card rounded-3xl p-10 border-2 border-white/30 hover:scale-105 transition-all">
                <div className="flex gap-2 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={24} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white text-lg leading-relaxed italic mb-8 font-medium">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-black text-white text-xl">{testimonial.name}</div>
                    <div className="text-white/80 font-semibold">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8">
            Ready to Start Saving?
          </h2>
          <p className="text-2xl text-gray-600 mb-12 font-medium">
            Join thousands of members building their financial future with UnityLedger.
          </p>
          <button
            onClick={onGetStarted}
            className="group btn-primary px-12 py-6 text-2xl inline-flex items-center gap-4"
          >
            Create Your Account
            <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src="/UL copy.png" alt="UnityLedger" className="h-10 w-10" />
                <span className="text-2xl font-black text-white">UnityLedger</span>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium">
                The modern way to save together. Powered by blockchain technology.
              </p>
            </div>
            <div>
              <h3 className="font-black text-white mb-6 text-lg">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors font-medium">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors font-medium">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-black text-white mb-6 text-lg">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors font-medium">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-black text-white mb-6 text-lg">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors font-medium">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-500 font-medium">
            © 2025 UnityLedger. All rights reserved. Built on Starknet.
          </div>
        </div>
      </footer>
    </div>
  );
}
