import React, { useState, useEffect } from 'react';
import { Mail, Send, X, AlertCircle } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export function GmailContactForm({ onClose }: { onClose: () => void }) {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [inquiryType, setInquiryType] = useState('Leasing Inquiry');
  const [unitNumber, setUnitNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsub = initAuth(
      () => setNeedsAuth(false),
      () => setNeedsAuth(true)
    );
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setErrorMsg('Failed to sign in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSend = async () => {
    if (!fullName || !phoneNumber || !message) {
      setErrorMsg('Please fill out Name, Phone, and your Message.');
      return;
    }

    setIsSending(true);
    setErrorMsg('');

    try {
      const confirmed = window.confirm('Send this secure rent/leasing intake inquiry via your connected Gmail account?');
      if (!confirmed) {
        setIsSending(false);
        return;
      }

      // Build a beautifully structured HTML email template
      const emailSubject = subject || `[Rent-Ruby Intake] ${inquiryType} - ${fullName}`;
      const emailLines = [];
      emailLines.push('To: hello@rent-ruby.com');
      emailLines.push('Cc: bryan@norcalcarbmobile.com');
      emailLines.push('Content-type: text/html;charset=utf-8');
      emailLines.push('MIME-Version: 1.0');
      emailLines.push('Subject: ' + emailSubject);
      emailLines.push('');
      
      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; rounded: 12px; background-color: #ffffff;">
          <h2 style="color: #FF5F1F; font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; border-bottom: 2px solid #FF5F1F; padding-bottom: 10px;">Rent-Ruby Intake Form Submission</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #52525b; width: 140px;">Full Name:</td>
              <td style="padding: 8px 0; color: #09090b;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #52525b;">Phone Number:</td>
              <td style="padding: 8px 0; color: #09090b;"><a href="tel:${phoneNumber}" style="color: #FF5F1F; text-decoration: none;">${phoneNumber}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #52525b;">Inquiry Type:</td>
              <td style="padding: 8px 0; color: #09090b;"><span style="background-color: #eaeaea; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${inquiryType}</span></td>
            </tr>
            ${unitNumber ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #52525b;">Unit Number:</td>
              <td style="padding: 8px 0; color: #09090b;">Union #${unitNumber}</td>
            </tr>
            ` : ''}
          </table>

          <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p style="font-weight: bold; color: #3f3f46; margin-top: 0;">Message / Details:</p>
            <p style="color: #18181b; white-space: pre-wrap; line-height: 1.5; margin-bottom: 0;">${message}</p>
          </div>

          <div style="margin-top: 30px; font-size: 11px; color: #a1a1aa; border-top: 1px solid #e4e4e7; padding-top: 15px; text-align: center;">
            Sent securely via Rent-Ruby Mosswood Oakland Gmail Integration.
          </div>
        </div>
      `;

      emailLines.push(htmlBody);

      const email = emailLines.join('\r\n').trim();
      // Safe base64 encoding with utf-8 support
      const encodedEmail = btoa(unescape(encodeURIComponent(email))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': "Bearer " + cachedAccessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Failed to send email');
      }

      setSendSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Send error:', err);
      setErrorMsg(err.message || 'Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-app-bg/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-app-card border-2 border-app-border rounded-[2.5rem] shadow-2xl p-8 relative my-8"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-app-text/50 hover:text-app-text transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-app-accent/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-app-accent" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-app-text uppercase tracking-tight">Leasing & Resident Intake</h3>
            <p className="text-sm font-bold text-app-text/50">Dispatched securely via your hooked Gmail account</p>
          </div>
        </div>

        {needsAuth ? (
          <div className="text-center py-8">
            <p className="text-app-text/70 mb-6 font-medium">Please sign in with your Google Workspace or Gmail account to authorize and send secure communications directly.</p>
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button w-full flex items-center justify-center gap-3 bg-white text-black py-3 px-6 rounded-xl font-bold shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6" style={{display: 'block'}}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              {isLoggingIn ? 'Signing In...' : 'Sign in with Google'}
            </button>
          </div>
        ) : sendSuccess ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Send className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-bold text-app-text uppercase">Intake Submitted!</h4>
            <p className="text-app-text/60">Your secure intake has been emailed to Lauren at <strong className="text-app-text">hello@rent-ruby.com</strong> and copy-forwarded/CC'd to Bryan at <strong className="text-app-text">bryan@norcalcarbmobile.com</strong>.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-ruby/10 border border-ruby/20 flex gap-3 text-ruby">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-bold">{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-app-text/50 mb-1.5">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-app-text font-medium focus:ring-2 focus:ring-app-accent focus:outline-none transition-all placeholder:text-app-text/20"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-app-text/50 mb-1.5">Phone Number *</label>
                <input 
                  type="tel" 
                  required
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-app-text font-medium focus:ring-2 focus:ring-app-accent focus:outline-none transition-all placeholder:text-app-text/20"
                  placeholder="(510) 555-1234"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-app-text/50 mb-1.5">Inquiry Type</label>
                <select 
                  value={inquiryType}
                  onChange={e => setInquiryType(e.target.value)}
                  className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-app-text font-medium focus:ring-2 focus:ring-app-accent focus:outline-none transition-all"
                >
                  <option value="Leasing Inquiry">Leasing Inquiry</option>
                  <option value="Schedule a Tour">Schedule a Tour</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Maintenance Request">Maintenance Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-app-text/50 mb-1.5">Unit Number (Optional)</label>
                <input 
                  type="text" 
                  value={unitNumber}
                  onChange={e => setUnitNumber(e.target.value)}
                  className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-app-text font-medium focus:ring-2 focus:ring-app-accent focus:outline-none transition-all placeholder:text-app-text/20"
                  placeholder="e.g. Unit 302"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-app-text/50 mb-1.5">Inquiry Subject (Optional)</label>
              <input 
                type="text" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-app-text font-medium focus:ring-2 focus:ring-app-accent focus:outline-none transition-all placeholder:text-app-text/20"
                placeholder="Defaults to auto-generated subject"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-app-text/50 mb-1.5">Inquiry Message *</label>
              <textarea 
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-app-text font-medium focus:ring-2 focus:ring-app-accent focus:outline-none transition-all resize-none placeholder:text-app-text/20"
                placeholder="What details would you like to share?"
              />
            </div>

            <button 
              onClick={handleSend}
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 bg-app-text text-app-bg py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-app-accent hover:text-white transition-all disabled:opacity-50 mt-2"
            >
              {isSending ? 'Sending Intake...' : 'Submit Secure Intake'} <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
