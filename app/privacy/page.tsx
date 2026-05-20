import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, ArrowLeft, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Creatabl-IA',
  description: 'Privacy Policy and Data Protection guidelines for Creatabl-IA, explaining how we collect, store, and process your data.',
}

export default function PrivacyPage() {
  const sections = [
    { id: 'data-collection', title: '1. What Data We Collect' },
    { id: 'data-usage', title: '2. How We Use Your Data' },
    { id: 'third-parties', title: '3. Third-Party Services' },
    { id: 'data-storage', title: '4. Data Storage & Security' },
    { id: 'oauth-tokens', title: '5. OAuth Token Retention' },
    { id: 'user-rights', title: '6. Your User Rights' },
    { id: 'contact', title: '7. Contact Information' },
  ]

  return (
    <div className="dark min-h-screen bg-[#0A0A0F] text-foreground flex flex-col relative selection:bg-[#7F77DD]/30 selection:text-white">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#7F77DD]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0A0F]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" id="header-logo-link" className="flex items-center gap-2 group">
            {/* Logo Mark - Exact SVG rendered inline to control fill color */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-7 h-7 shrink-0 transition-transform duration-200 group-hover:scale-105">
              <g transform="translate(50,50)">
                {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((angle) => (
                  <rect
                    key={angle}
                    x="-5"
                    y="-42"
                    width="10"
                    height="22"
                    rx="4"
                    fill="#7F77DD"
                    transform={`rotate(${angle})`}
                  />
                ))}
                <circle cx="0" cy="0" r="22" fill="#7F77DD" />
              </g>
            </svg>
            
            {/* Brand Name - Matching Sidebar Font and Style */}
            <span className="flex items-baseline gap-0 leading-none">
              <span className="text-[17px] font-semibold tracking-tight text-white">
                Creatabl.
              </span>
              <span
                className="text-[17px] font-normal italic text-[#7F77DD]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                ia
              </span>
            </span>
          </Link>

          <Link
            href="/dashboard"
            id="back-to-app-header-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground border border-white/5 hover:border-[#7F77DD]/30 bg-white/5 hover:bg-[#7F77DD]/10 transition-all duration-200"
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
            <Shield className="w-3.5 h-3.5" />
            Privacy Protection
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Last updated: May 19, 2026
          </p>
        </div>

        {/* Two Column Layout: TOC & Detailed Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
          {/* Table of Contents - Hidden on Mobile, Sticky on Desktop */}
          <aside className="hidden lg:block sticky top-32 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Table of Contents
            </h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  id={`toc-link-${section.id}`}
                  className="block text-sm text-muted-foreground hover:text-[#7F77DD] hover:translate-x-1 transition-all duration-150 py-1"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Detailed Content */}
          <div className="space-y-12">
            {/* Section 1: What Data We Collect */}
            <section id="data-collection" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-[#7F77DD]">1.</span> What Data We Collect
              </h2>
              <div className="text-muted-foreground space-y-3 leading-relaxed text-sm">
                <p>
                  To provide our social media copilot services, we collect information that helps personalize your experience and execute social media publication:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li><strong>Account Information</strong>: Your name, email address, profile picture, and organization details provided during registration.</li>
                  <li><strong>Social OAuth Tokens</strong>: Access tokens and refresh tokens granted by social platform providers (LinkedIn, Facebook, Instagram, X) to connect accounts and automate posting.</li>
                  <li><strong>Post Content</strong>: Drafts, schedules, media attachments, images, and text generated or uploaded to be posted on social platforms.</li>
                  <li><strong>Usage Analytics</strong>: Interaction logs, page views, click stats, features used, and timing data to help us optimize the platform&apos;s UI/UX.</li>
                </ul>
              </div>
            </section>

            {/* Section 2: How We Use Your Data */}
            <section id="data-usage" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-[#7F77DD]">2.</span> How We Use Your Data
              </h2>
              <div className="text-muted-foreground space-y-3 leading-relaxed text-sm">
                <p>
                  We process user data under strict compliance with standard data protection policies. Specifically, your data is used to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Operate, maintain, and provide the core functions of the Service.</li>
                  <li>Power AI features, including text generation, suggestions, and content analysis.</li>
                  <li>Perform background tasks to schedule, queue, and publish posts to your connected social channels.</li>
                  <li>Monitor platform performance, diagnose security vulnerabilities, and resolve technical bugs.</li>
                  <li>Communicate support updates, changes to terms, and subscription status billing.</li>
                </ul>
              </div>
            </section>

            {/* Section 3: Third-Party Services */}
            <section id="third-parties" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-[#7F77DD]">3.</span> Third-Party Services
              </h2>
              <div className="text-muted-foreground space-y-3 leading-relaxed text-sm">
                <p>
                  We collaborate with external infrastructure and integration providers to support our features. Your data is partially processed by these platforms:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Clerk</strong>: Handles user authentication, profile security, and access control.</li>
                  <li><strong>Neon</strong>: Provides cloud hosting and storage for our relational database systems.</li>
                  <li><strong>Vercel</strong>: Hosts the platform application servers and serverless environments.</li>
                  <li><strong>Canva API</strong>: Powers media library syncing and design imports within the editor.</li>
                  <li><strong>Social Media APIs</strong>: LinkedIn API, Meta (Instagram & Facebook Graph API), and X API to execute publishing and account syncs.</li>
                </ul>
              </div>
            </section>

            {/* Section 4: Data Storage & Security */}
            <section id="data-storage" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-[#7F77DD]">4.</span> Data Storage & Security
              </h2>
              <div className="text-muted-foreground space-y-3 leading-relaxed text-sm">
                <p>
                  We prioritize security by utilizing cloud infrastructure providers that follow advanced security compliance structures.
                </p>
                <p>
                  All database columns storing sensitive user details, such as account preferences, are encrypted at rest. Communications between your browser and our servers are encrypted in transit via SSL/TLS protocols.
                </p>
              </div>
            </section>

            {/* Section 5: OAuth Token Retention */}
            <section id="oauth-tokens" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-[#7F77DD]">5.</span> OAuth Token Retention
              </h2>
              <div className="text-muted-foreground space-y-3 leading-relaxed text-sm">
                <p>
                  Access and refresh tokens linked to your social media profiles are stored securely in database systems using symmetric encryption algorithms.
                </p>
                <p>
                  <strong>Disconnection and Deletion:</strong> If you disconnect a social media account from the platform dashboard, the associated OAuth access and refresh tokens will be immediately disabled and permanently deleted from our primary servers and backups within 30 days.
                </p>
              </div>
            </section>

            {/* Section 6: Your User Rights */}
            <section id="user-rights" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-[#7F77DD]">6.</span> Your User Rights
              </h2>
              <div className="text-muted-foreground space-y-3 leading-relaxed text-sm">
                <p>
                  Under European data protection laws (GDPR) and other global privacy frameworks, you hold the following rights:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Access</strong>: Request a copy of all personal data we hold about you.</li>
                  <li><strong>Correction</strong>: Request the updates of any inaccurate or incomplete details.</li>
                  <li><strong>Erasure (Deletion)</strong>: Request that we delete all your stored accounts and data from our active databases.</li>
                  <li><strong>Revocation</strong>: Withdraw consent for third-party integrations by disconnecting your profiles.</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Contact Information */}
            <section id="contact" className="scroll-mt-32 space-y-4 border-t border-white/5 pt-8">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-[#7F77DD]">7.</span> Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                For questions regarding data processing, requests to delete your personal profile, or other privacy concerns, please contact our data team:
              </p>
              <div className="pt-2">
                <a
                  href="mailto:businessesonlinemail@gmail.com"
                  id="contact-email-link"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#7F77DD] hover:text-foreground border border-[#7F77DD]/20 hover:border-[#7F77DD] bg-[#7F77DD]/5 hover:bg-[#7F77DD]/10 transition-all duration-200 text-sm font-semibold"
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
      <footer className="border-t border-white/5 bg-[#08080C] py-10 mt-20 text-center text-xs text-muted-foreground font-medium">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Creatabl.ia. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/privacy" id="footer-privacy-link" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" id="footer-terms-link" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
