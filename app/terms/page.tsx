import { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowLeft, Scale, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Creatabl.ia',
  description: 'Terms of Service and Conditions of Use for Creatabl-IA, the AI-powered social media management copilot.',
}

export default function TermsPage() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'description', title: '2. Description of Service' },
    { id: 'registration', title: '3. Account Registration' },
    { id: 'responsibilities', title: '4. User Responsibilities' },
    { id: 'integrations', title: '5. Third-Party Integrations' },
    { id: 'ai-content', title: '6. AI-Generated Content' },
    { id: 'billing', title: '7. Subscription and Billing' },
    { id: 'termination', title: '8. Termination' },
    { id: 'liability', title: '9. Limitation of Liability' },
    { id: 'governing-law', title: '10. Governing Law' },
    { id: 'contact', title: '11. Contact Information' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-zinc-200 font-sans flex flex-col relative selection:bg-[#7F77DD]/30 selection:text-white">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#7F77DD]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0A0F]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" id="header-logo-link" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-[#7F77DD] rounded-xl flex items-center justify-center shadow-lg shadow-[#7F77DD]/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Creatabl<span className="text-[#7F77DD]">.ia</span>
            </span>
          </Link>

          <Link
            href="/dashboard"
            id="back-to-app-header-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white border border-white/5 hover:border-[#7F77DD]/30 bg-white/5 hover:bg-[#7F77DD]/10 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16">
        {/* Title / Hero */}
        <div className="space-y-4 mb-16 border-b border-white/5 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7F77DD]/10 border border-[#7F77DD]/20 text-[#7F77DD] text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-zinc-400 text-sm font-medium">
            Last updated: May 19, 2026
          </p>
        </div>

        {/* Two Column Layout: TOC & Detailed Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
          {/* Table of Contents - Hidden on Mobile, Sticky on Desktop */}
          <aside className="hidden lg:block sticky top-32 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
              Table of Contents
            </h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  id={`toc-link-${section.id}`}
                  className="block text-sm text-zinc-400 hover:text-[#7F77DD] hover:translate-x-1 transition-all duration-150 py-1"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Detailed Content */}
          <div className="space-y-12">
            {/* Section 1: Acceptance of Terms */}
            <section id="acceptance" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">1.</span> Acceptance of Terms
              </h2>
              <div className="text-zinc-400 space-y-3 leading-relaxed text-sm">
                <p>
                  By accessing or using the services provided by Creatabl-IA (&quot;the Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not access or use the Service.
                </p>
                <p>
                  These terms govern your use of the platform. We reserve the right to update or modify these terms at any time. We will notify you of any changes by posting the new terms on this page with a revised &quot;last updated&quot; date.
                </p>
              </div>
            </section>

            {/* Section 2: Description of Service */}
            <section id="description" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">2.</span> Description of Service
              </h2>
              <div className="text-zinc-400 space-y-3 leading-relaxed text-sm">
                <p>
                  Creatabl-IA is an AI-powered social media management platform designed to help users create, schedule, publish, and analyze social media content. The platform supports connectivity with major social networks:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                  <li><strong>LinkedIn</strong>: Connect personal or company profiles to schedule and post updates.</li>
                  <li><strong>Instagram</strong>: Schedule and publish photo and video posts.</li>
                  <li><strong>Facebook</strong>: Manage pages and automate scheduled content distribution.</li>
                  <li><strong>X (formerly Twitter)</strong>: Compose and queue posts for publication.</li>
                </ul>
                <p>
                  Additionally, the platform includes integration with <strong>Canva</strong>, allowing users to import, edit, and use media files directly in their content flows.
                </p>
              </div>
            </section>

            {/* Section 3: Account Registration */}
            <section id="registration" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">3.</span> Account Registration
              </h2>
              <div className="text-zinc-400 space-y-3 leading-relaxed text-sm">
                <p>
                  To access and utilize the full functionality of the platform, you must register for an account. Registration is securely managed via Clerk authentication.
                </p>
                <p>
                  You agree to provide accurate, current, and complete information during the registration process and to keep your credentials confidential. You are solely responsible for all activities that occur under your account.
                </p>
              </div>
            </section>

            {/* Section 4: User Responsibilities */}
            <section id="responsibilities" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">4.</span> User Responsibilities
              </h2>
              <div className="text-zinc-400 space-y-3 leading-relaxed text-sm">
                <p>
                  You agree to use the Service in compliance with all applicable laws and platform rules. Specifically, you agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use the platform to distribute unsolicited marketing material, spam, or bulk communications.</li>
                  <li>Publish content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable.</li>
                  <li>Infringe upon the intellectual property or privacy rights of any third party.</li>
                  <li>Attempt to bypass, disable, or interfere with security features of the platform or attempt unauthorized access to other user accounts.</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Third-Party Integrations */}
            <section id="integrations" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">5.</span> Third-Party Integrations
              </h2>
              <div className="text-zinc-400 space-y-3 leading-relaxed text-sm">
                <p>
                  Creatabl-IA relies on integrations with third-party networks, including Canva, LinkedIn, Instagram, Facebook, and X.
                </p>
                <p>
                  These integrations connect via secure OAuth flows. By authorizing these connections, you acknowledge and agree that your usage is also subject to the terms of service and developer guidelines of each respective third-party provider. We are not responsible for any changes or restrictions made by third-party platforms to their API capabilities.
                </p>
              </div>
            </section>

            {/* Section 6: AI-Generated Content */}
            <section id="ai-content" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">6.</span> AI-Generated Content
              </h2>
              <div className="text-zinc-400 space-y-3 leading-relaxed text-sm">
                <p>
                  Our Service utilizes advanced artificial intelligence features to assist with drafting, optimizing, and suggesting social media content.
                </p>
                <p>
                  While our AI aims to generate high-quality recommendations, you are solely responsible for the final review, verification, accuracy, and legality of any content published through the platform. Creatabl-IA is not liable for any generated content that violates third-party rights or platform guidelines.
                </p>
              </div>
            </section>

            {/* Section 7: Subscription and Billing */}
            <section id="billing" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">7.</span> Subscription and Billing
              </h2>
              <div className="text-zinc-400 space-y-3 leading-relaxed text-sm">
                <p>
                  We offer various subscription tiers tailored to different usage needs. Subscription terms are billed monthly on a recurring basis.
                </p>
                <p>
                  <strong>Cancellation Policy:</strong> You may cancel your subscription at any time via your Billing settings. Following cancellation, you will retain access to the paid tier features until the end of your current active billing cycle, after which your account will transition to a free or disconnected state.
                </p>
              </div>
            </section>

            {/* Section 8: Termination */}
            <section id="termination" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">8.</span> Termination
              </h2>
              <div className="text-zinc-400 space-y-3 leading-relaxed text-sm">
                <p>
                  We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without prior notice, if you breach these Terms of Service or engage in activities that cause legal risk or reputational harm to the platform.
                </p>
              </div>
            </section>

            {/* Section 9: Limitation of Liability */}
            <section id="liability" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">9.</span> Limitation of Liability
              </h2>
              <div className="text-zinc-400 space-y-3 leading-relaxed text-sm">
                <p>
                  To the maximum extent permitted by applicable law, Creatabl-IA and its directors, employees, or partners shall not be held liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, or other intangible losses resulting from:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Your use of or inability to use the Service.</li>
                  <li>Any unauthorized access, use, or alteration of your content or transmissions.</li>
                  <li>Service disruptions caused by third-party APIs or infrastructure outages.</li>
                </ul>
              </div>
            </section>

            {/* Section 10: Governing Law */}
            <section id="governing-law" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">10.</span> Governing Law
              </h2>
              <div className="text-zinc-400 space-y-3 leading-relaxed text-sm">
                <p>
                  These Terms of Service and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of <strong>France</strong>, without giving effect to any choice or conflict of law provision.
                </p>
              </div>
            </section>

            {/* Section 11: Contact Information */}
            <section id="contact" className="scroll-mt-32 space-y-4 border-t border-white/5 pt-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#7F77DD]">11.</span> Contact Information
              </h2>
              <p className="text-zinc-400 leading-relaxed text-sm">
                For questions, clarifications, or disputes regarding these Terms of Service, please contact us:
              </p>
              <div className="pt-2">
                <a
                  href="mailto:businessesonlinemail@gmail.com"
                  id="contact-email-link"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#7F77DD] hover:text-white border border-[#7F77DD]/20 hover:border-[#7F77DD] bg-[#7F77DD]/5 hover:bg-[#7F77DD]/10 transition-all duration-200 text-sm font-semibold"
                >
                  <Mail className="w-4 h-4" />
                  businessesonlinemail@gmail.com
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#08080C] py-10 mt-20 text-center text-xs text-zinc-500 font-medium">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Creatabl.ia. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/privacy" id="footer-privacy-link" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" id="footer-terms-link" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
