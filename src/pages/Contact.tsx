import React, { useState } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle, HelpCircle, ChevronDown } from 'lucide-react';
import { sendContactMessage } from '../services/resourceService';
import { SiteSettings } from '../types';

interface ContactProps {
  siteSettings: SiteSettings;
}

export function Contact({ siteSettings }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Who can download resources from the Hub?',
      a: 'Public resources are freely downloadable by all visitors. Protected manuals, scripts, and production configurations require a free registered account with a verified email address to maintain security standards.',
    },
    {
      q: 'Can I use these scripts and runbooks in my commercial enterprise?',
      a: 'Yes. Unless specified otherwise on an individual document page, all materials are licensed for internal enterprise IT operations, configuration management, and disaster recovery.',
    },
    {
      q: 'Are custom architecture reviews or incident response consultations available?',
      a: 'Yes. You can submit an inquiry through this contact form describing your infrastructure scale, requirements, or Sev-1 postmortem review needs.',
    },
    {
      q: 'How frequently are CIS benchmarks and scripts updated?',
      a: 'Blueprints are audited and updated on a quarterly basis or immediately upon major upstream release (e.g., Kubernetes minor version increments or CIS benchmark revisions).',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendContactMessage(name.trim(), email.trim(), subject.trim(), message.trim());
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="bg-[#101C32] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55D6FF]">Direct Advisory</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact & Advisory Desk</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Have questions regarding an enterprise architecture blueprint, wish to suggest a new runbook topic, or require advisory services? Reach out directly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Send an Advisory Message</h2>
          <p className="text-xs text-slate-500 mb-6">
            Inquiries are delivered directly to the expert desk. Typical response time is within 1 business day.
          </p>

          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 space-y-3 text-center">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
              <h3 className="font-bold text-base">Message Transmitted Successfully</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed max-w-md mx-auto">
                Thank you for reaching out. Your inquiry has been logged in our secure system and our team will review your specifications shortly.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-2 px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={150}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@enterprise.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Kubernetes Zero-Trust Implementation Consultation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inquiry Details / Technical Context *
                </label>
                <textarea
                  required
                  rows={5}
                  maxLength={3000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your architecture scale, technology stack, requirements, or feedback..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <div className="text-[11px] text-slate-400 text-right mt-1">
                  {message.length} / 3000 characters
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  'Transmitting Message...'
                ) : (
                  <>
                    <Send size={14} /> Send Message to Advisory Desk
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Info & FAQ (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Details Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Direct Contact Details
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Email Consultation</div>
                  <div>{siteSettings.contactEmail || 'expert@nexustech-hub.com'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Advisory Desk Hours</div>
                  <div>Monday — Friday: 08:00 — 18:00 UTC</div>
                  <div className="text-slate-400 text-[11px]">Sev-1 On-Call Emergency Escalation for Partners</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Operating Practice</div>
                  <div>Global Cloud & Infrastructure Engineering Practice</div>
                </div>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle size={16} className="text-blue-500" /> Frequently Asked Questions
            </h3>

            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-3 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-3 pb-3 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
