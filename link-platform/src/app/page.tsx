"use client";

import Link from "next/link";
import {
  Link2,
  BarChart3,
  QrCode,
  Globe,
  Zap,
  Shield,
  Smartphone,
  Tag,
  ArrowRight,
  Check,
  Star,
  MousePointerClick,
  Target,
  Users,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AWLinks</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#analytics" className="text-sm text-gray-600 hover:text-gray-900">Analytics</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2">
              Log in
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-sm text-brand-700 mb-6">
            <Zap className="w-3.5 h-3.5" />
            The modern link management platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
            Short links with
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
              superpowers
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            AWLinks is the link management platform for modern marketing teams.
            Create short links, track real-time analytics, generate QR codes,
            and optimize every click.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              See features
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required &middot; 25 free links/month
          </p>
        </div>

        {/* Hero Visual */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/50 p-2">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Mock Dashboard */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <div className="ml-4 flex-1 bg-gray-200 rounded h-5 max-w-xs" />
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-2xl font-bold text-blue-900">12.4K</p>
                  <p className="text-xs text-blue-600">Total Clicks</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-900">847</p>
                  <p className="text-xs text-green-600">Links Created</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <p className="text-2xl font-bold text-purple-900">32</p>
                  <p className="text-xs text-purple-600">Countries</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                  <p className="text-2xl font-bold text-orange-900">98.2%</p>
                  <p className="text-xs text-orange-600">Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything you need to manage links
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From simple link shortening to advanced analytics and targeting,
              AWLinks gives you complete control over your links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section id="analytics" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Real-time analytics that matter
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Track every click with detailed insights on location, devices,
                browsers, and referrers. Know exactly how your links perform.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Click tracking with geo-location",
                  "Device & browser breakdown",
                  "Referrer source attribution",
                  "Real-time click stream",
                  "Custom date range reports",
                  "Export analytics data",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-2 mt-8 text-brand-600 font-semibold hover:text-brand-700"
              >
                Explore Analytics
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
              {/* Mock Analytics Chart */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Clicks Over Time</h4>
                  <span className="text-sm text-gray-500">Last 7 days</span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-brand-200 rounded-t hover:bg-brand-400 transition-colors"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Mon</span><span>Tue</span><span>Wed</span>
                  <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl border p-8 ${
                  plan.popular
                    ? "bg-white border-brand-300 shadow-lg shadow-brand-100 ring-1 ring-brand-200 relative"
                    : "bg-white border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-600 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-brand-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={`mt-8 block text-center px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    plan.popular
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Ready to supercharge your links?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of marketers who use AWLinks to manage, track,
            and optimize their links.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                  <Link2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-gray-900">AWLinks</span>
              </div>
              <p className="text-sm text-gray-500">
                The modern link management platform for marketing teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-gray-900">Features</a></li>
                <li><a href="#pricing" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="#analytics" className="hover:text-gray-900">Analytics</a></li>
                <li><a href="#" className="hover:text-gray-900">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Changelog</a></li>
                <li><a href="#" className="hover:text-gray-900">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="hover:text-gray-900">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            &copy; 2026 AWLinks by ABetWorks. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Link2,
    title: "Custom Short Links",
    description: "Create branded short links with your own custom domain for better recognition and trust.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track clicks, geographic data, devices, browsers, and referrers in real-time.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: QrCode,
    title: "QR Code Generation",
    description: "Auto-generate branded QR codes for every link with customizable colors and sizes.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Target,
    title: "Geo & Device Targeting",
    description: "Redirect users to different destinations based on their location or device type.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Shield,
    title: "Link Protection",
    description: "Password-protect links, set expiration dates, and control access to your content.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Tag,
    title: "UTM Builder",
    description: "Add UTM parameters to track campaigns. Organize links with tags and folders.",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    icon: Globe,
    title: "Custom Domains",
    description: "Use your own domain for short links. Full DNS management and SSL included.",
    color: "bg-teal-100 text-teal-600",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite team members with role-based access. Share workspaces and manage together.",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Zap,
    title: "API & Integrations",
    description: "Full REST API for programmatic link creation. Integrate with your existing tools.",
    color: "bg-pink-100 text-pink-600",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    description: "For individuals getting started",
    popular: false,
    cta: "Start Free",
    features: [
      "25 links per month",
      "3 custom domains",
      "1,000 click events",
      "Basic analytics",
      "QR codes",
      "API access",
    ],
  },
  {
    name: "Pro",
    price: 25,
    description: "For growing marketing teams",
    popular: true,
    cta: "Start Pro Trial",
    features: [
      "1,000 links per month",
      "10 custom domains",
      "50,000 click events",
      "Advanced analytics",
      "UTM templates",
      "Password protection",
      "Link expiration",
      "Geo & device targeting",
      "Priority support",
    ],
  },
  {
    name: "Business",
    price: 99,
    description: "For large teams and agencies",
    popular: false,
    cta: "Contact Sales",
    features: [
      "Unlimited links",
      "Unlimited domains",
      "Unlimited events",
      "Real-time analytics",
      "Team collaboration",
      "Custom branding",
      "SLA guarantee",
      "Dedicated support",
      "SSO / SAML",
    ],
  },
];
