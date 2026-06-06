import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Mail, MessageSquare, Check, ExternalLink, Send, ArrowRight } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('Check out 3875 Ruby in Oakland!');
  const [emailSent, setEmailSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const shareTitle = '3875 Ruby — Positive Vibes Live Here';
  const shareText = 'Check out 3875 Ruby, a beautiful boutique residential community in Oakland with positive vibes, smart facilities, and modern living!';
  const shareUrl = window.location.origin || 'https://rent-ruby.com';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        console.warn('Native share failed', err);
      }
    }
  };

  const handleSendCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    setIsSending(true);
    try {
      // Send share email through our internal intake endpoint styled as a recommendation
      await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 1, // default mock tenant
          friend_name: 'Interested Friend',
          friend_email: customEmail,
          custom_message: `${shareText}\n\nView properties here: ${shareUrl}`
        })
      });
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
        setCustomEmail('');
      }, 3000);
    } catch (err) {
      console.error('Error sending share email', err);
    } finally {
      setIsSending(false);
    }
  };

  const mailtoLink = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nLink: ${shareUrl}`)}`;
  const smsLink = `sms:?body=${encodeURIComponent(`${shareTitle} — ${shareUrl}`)}`;
  const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle} — ${shareUrl}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet panel */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full sm:max-w-md bg-zinc-950 border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl p-6 overflow-hidden z-10 text-white"
      >
        {/* Decorative notch for drawer on mobile */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden cursor-pointer" onClick={onClose} />

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="inline-block w-1.5 h-6 bg-app-accent" /> Share Rent-Ruby
            </h3>
            <p className="text-xs text-white/50 uppercase tracking-widest font-bold mt-1">Spread the Oakland Soul vibe</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Grid representing standard iOS/Android Share Card */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Copy option */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 text-center p-2 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-[#FF5F1F]/10 border border-[#FF5F1F]/20 text-app-accent group-hover:scale-105'}`}>
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 group-hover:text-white">
              {copied ? 'Copied' : 'Copy Link'}
            </span>
          </button>

          {/* Email option */}
          <a
            href={mailtoLink}
            className="flex flex-col items-center gap-2 text-center p-2 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#FF5F1F]/10 border border-[#FF5F1F]/20 text-app-accent flex items-center justify-center group-hover:scale-105 transition-all">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 group-hover:text-white">
              Email Client
            </span>
          </a>

          {/* SMS option */}
          <a
            href={smsLink}
            className="flex flex-col items-center gap-2 text-center p-2 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#FF5F1F]/10 border border-[#FF5F1F]/20 text-app-accent flex items-center justify-center group-hover:scale-105 transition-all">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 group-hover:text-white">
              Sms Text
            </span>
          </a>

          {/* WhatsApp option */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-center p-2 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-all">
              <ExternalLink className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 group-hover:text-white">
              WhatsApp
            </span>
          </a>
        </div>

        {/* Native OS Trigger block (if supported) */}
        {typeof navigator.share !== 'undefined' && (
          <div className="mb-6">
            <button
              onClick={handleNativeShare}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest text-[#FF5F1F] flex items-center justify-center gap-2 cursor-pointer"
            >
              Open Device Share Sheet
            </button>
          </div>
        )}

        {/* Emailing customized sharing options directly inside app! */}
        <div className="border-t border-white/10 pt-6">
          <div className="text-xs font-black uppercase tracking-widest text-[#FF5F1F] mb-4">
            Send a fast email invite
          </div>

          {emailSent ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center"
            >
              ✉️ Dynamic referral/share email successfully sent!
            </motion.div>
          ) : (
            <form onSubmit={handleSendCustomEmail} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="flex-1 px-4 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-xl focus:border-app-accent focus:outline-none text-white tracking-wide"
                  required
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 bg-app-accent hover:bg-app-accent/90 disabled:bg-white/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest text-white flex items-center gap-1 cursor-pointer"
                >
                  {isSending ? '...' : <><Send className="w-3.5 h-3.5" /> Send</>}
                </button>
              </div>
              <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                Your friend will receive a clean, beautifully formatted invite linking directly to this preview site.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
