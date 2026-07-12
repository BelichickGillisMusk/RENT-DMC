import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  ShieldAlert, 
  Wrench, 
  Settings, 
  Sparkles, 
  Check, 
  Send, 
  AlertTriangle, 
  Smartphone, 
  Clock, 
  Lock,
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';

interface SimulatedAlert {
  id: string;
  type: 'maintenance' | 'security';
  title: string;
  body: string;
  channel: 'email' | 'push' | 'both';
  timestamp: string;
}

export const AdminNotificationSettings: React.FC = () => {
  // Notification states with persistence
  const [maintenanceEmail, setMaintenanceEmail] = useState<boolean>(() => {
    return localStorage.getItem('ruby_notify_maint_email') !== 'false';
  });
  const [maintenancePush, setMaintenancePush] = useState<boolean>(() => {
    return localStorage.getItem('ruby_notify_maint_push') !== 'false';
  });
  const [securityEmail, setSecurityEmail] = useState<boolean>(() => {
    return localStorage.getItem('ruby_notify_sec_email') !== 'false';
  });
  const [securityPush, setSecurityPush] = useState<boolean>(() => {
    return localStorage.getItem('ruby_notify_sec_push') !== 'false';
  });

  const [maintDest, setMaintDest] = useState<string>('hello@rent-ruby.com');
  const [maintCc, setMaintCc] = useState<string>('bryan@norcalcarbmobile.com');
  const [urgencyThreshold, setUrgencyThreshold] = useState<'all' | 'high' | 'critical'>('high');

  // Test Simulation Alert Feed state
  const [alertsLog, setAlertsLog] = useState<SimulatedAlert[]>([]);
  const [showSimNotification, setShowSimNotification] = useState<SimulatedAlert | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Save preferences immediately on change
  useEffect(() => {
    localStorage.setItem('ruby_notify_maint_email', String(maintenanceEmail));
  }, [maintenanceEmail]);

  useEffect(() => {
    localStorage.setItem('ruby_notify_maint_push', String(maintenancePush));
  }, [maintenancePush]);

  useEffect(() => {
    localStorage.setItem('ruby_notify_sec_email', String(securityEmail));
  }, [securityEmail]);

  useEffect(() => {
    localStorage.setItem('ruby_notify_sec_push', String(securityPush));
  }, [securityPush]);

  const triggerSuccesState = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const simulateNotification = (type: 'maintenance' | 'security') => {
    const freshId = Date.now().toString();
    const timeStr = new Date().toLocaleTimeString();
    
    let generated: SimulatedAlert;
    
    if (type === 'maintenance') {
      const isEmail = maintenanceEmail;
      const isPush = maintenancePush;
      
      if (!isEmail && !isPush) {
        triggerSuccesState('⚠️ Turn on Maintenance Alerts first to simulate!');
        return;
      }

      generated = {
        id: freshId,
        type: 'maintenance',
        title: 'New Maintenance Filed',
        body: `Unit 3A: Kitchen disposal jammed. Priority set to High. Drafted to ${maintDest} (CC: ${maintCc})`,
        channel: isEmail && isPush ? 'both' : isEmail ? 'email' : 'push',
        timestamp: timeStr
      };
    } else {
      const isEmail = securityEmail;
      const isPush = securityPush;

      if (!isEmail && !isPush) {
        triggerSuccesState('⚠️ Turn on Security Alerts first to simulate!');
        return;
      }

      generated = {
        id: freshId,
        type: 'security',
        title: `🚨 Urgent Security Incident`,
        body: `Courtyard access breach detected (AI Optics). Threat Level: High. Urgency Met: ${urgencyThreshold.toUpperCase()}`,
        channel: isEmail && isPush ? 'both' : isEmail ? 'email' : 'push',
        timestamp: timeStr
      };
    }

    // Append to live feed log
    setAlertsLog(prev => [generated, ...prev].slice(0, 5));
    
    // Show premium floating notification preview
    setShowSimNotification(generated);
    setTimeout(() => {
      setShowSimNotification(null);
    }, 5500);

    triggerSuccesState('🚀 Active Dispatch Simulated Successfully!');
  };

  return (
    <div className="p-8 md:p-10 bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
      
      {/* Dynamic background accents representing the Giants-inspired modern layout */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-[#FF5F1F]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Floater push notification mockup */}
      <AnimatePresence>
        {showSimNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-28 right-6 z-[999] max-w-sm w-full bg-black/95 backdrop-blur-xl border border-[#FF5F1F]/40 p-4 rounded-2xl shadow-[0_15px_40px_rgba(255,95,31,0.25)] text-white"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${
                  showSimNotification.type === 'maintenance' ? 'bg-[#FF5F1F]/20 text-[#FF5F1F]' : 'bg-red-600/20 text-red-500'
                }`}>
                  {showSimNotification.type === 'maintenance' ? <Wrench className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider block text-[#FF5F1F]">Automated Notification</span>
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{showSimNotification.timestamp}</span>
                </div>
              </div>
              <button onClick={() => setShowSimNotification(null)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1 mt-2">
              <h5 className="text-xs font-black uppercase tracking-wide text-white">{showSimNotification.title}</h5>
              <p className="text-[10px] text-white/70 leading-relaxed font-semibold">{showSimNotification.body}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[8px] font-mono uppercase tracking-widest text-[#FF5F1F]">
              <span>Channel: {showSimNotification.channel}</span>
              <span className="text-emerald-400">Delivered!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-[#FF5F1F]/15 border border-[#FF5F1F]/20 text-[#FF5F1F] text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
              Automated Operations Dispatch
            </span>
            <span className="text-emerald-400 text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> System Active
            </span>
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-app-accent" /> Notification & Dispatch Settings
          </h3>
          <p className="text-xs text-white/50 uppercase tracking-widest font-bold mt-1">
            Toggle automated emails and real-time push events for active on-site response.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <AnimatePresence>
            {successMsg && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[9px] font-black uppercase tracking-widest text-[#FF5F1F] bg-[#FF5F1F]/10 border border-[#FF5F1F]/15 px-3 py-1.5 rounded-full"
              >
                {successMsg}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tier 1: Maintenance Notifications Control Block */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF5F1F]/5 rounded-bl-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FF5F1F]/10 border border-[#FF5F1F]/20">
              <Wrench className="w-5 h-5 text-[#FF5F1F]" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white leading-none">Maintenance Requests</h4>
              <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold mt-1 block">New active work tickets</span>
            </div>
          </div>

          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
            Triggers immediately whenever a resident files a new maintenance report online or offline.
          </p>

          <div className="space-y-4">
            
            {/* Email Toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-950/60 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Mail className={`w-4 h-4 ${maintenanceEmail ? 'text-[#FF5F1F]' : 'text-white/30'}`} />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-white block">Email Dispatch Notification</span>
                  <span className="text-[9px] text-white/40 font-bold block">Sends copy-CC email alerts</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setMaintenanceEmail(p => !p);
                  triggerSuccesState('Maintenance Emails Updated!');
                }}
                className={`w-12 h-6.5 rounded-full p-1 transition-all ${
                  maintenanceEmail ? 'bg-[#FF5F1F]' : 'bg-zinc-800'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transition-all ${
                  maintenanceEmail ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Email destinations custom fields */}
            {maintenanceEmail && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-zinc-950 border border-[#FF5F1F]/15 rounded-2xl space-y-3"
              >
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-[#FF5F1F] block mb-1">Send to Assistant</label>
                  <input
                    type="text"
                    value={maintDest}
                    onChange={(e) => setMaintDest(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#FF5F1F]"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-[#FF5F1F] block mb-1">Carbon Copy (Bryan)</label>
                  <input
                    type="text"
                    value={maintCc}
                    onChange={(e) => setMaintCc(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#FF5F1F]"
                  />
                </div>
              </motion.div>
            )}

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-950/60 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Smartphone className={`w-4 h-4 ${maintenancePush ? 'text-[#FF5F1F]' : 'text-white/30'}`} />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-white block">Real-Time Mobile Push</span>
                  <span className="text-[9px] text-white/40 font-bold block">Popups delivered onto admin terminal</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setMaintenancePush(p => !p);
                  triggerSuccesState('Maintenance Push Alerts Updated!');
                }}
                className={`w-12 h-6.5 rounded-full p-1 transition-all ${
                  maintenancePush ? 'bg-[#FF5F1F]' : 'bg-zinc-800'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transition-all ${
                  maintenancePush ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>

          <div className="pt-2">
            <button 
              onClick={() => simulateNotification('maintenance')}
              className="w-full py-3 bg-[#FF5F1F]/10 hover:bg-[#FF5F1F]/20 border border-[#FF5F1F]/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#FF5F1F] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Simulate Maintenance Request Alert
            </button>
          </div>
        </div>

        {/* Tier 2: Urgent Security Notifications Control Block */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-bl-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-600/10 border border-red-600/20">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white leading-none">Security Concerns & Alerts</h4>
              <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold mt-1 block">Live physical threats monitoring</span>
            </div>
          </div>

          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
            Automated alerts dispatched during optical triggers, night security violations or access override attempts.
          </p>

          <div className="space-y-4">
            
            {/* Email Toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-950/60 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Mail className={`w-4 h-4 ${securityEmail ? 'text-red-500' : 'text-white/30'}`} />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-white block">Email Dispatch Notification</span>
                  <span className="text-[9px] text-white/40 font-bold block">Sends warning code to property emails</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSecurityEmail(p => !p);
                  triggerSuccesState('Security Emails Updated!');
                }}
                className={`w-12 h-6.5 rounded-full p-1 transition-all ${
                  securityEmail ? 'bg-[#FF5F1F]' : 'bg-zinc-800'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transition-all ${
                  securityEmail ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-950/60 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Smartphone className={`w-4 h-4 ${securityPush ? 'text-red-500' : 'text-white/30'}`} />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-white block">Optics Push Terminal Messages</span>
                  <span className="text-[9px] text-white/40 font-bold block">Real-time emergency sound-triggered cues</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSecurityPush(p => !p);
                  triggerSuccesState('Security Push Alerts Updated!');
                }}
                className={`w-12 h-6.5 rounded-full p-1 transition-all ${
                  securityPush ? 'bg-[#FF5F1F]' : 'bg-zinc-800'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transition-all ${
                  securityPush ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Urgency selection button group */}
            <div className="p-3 bg-zinc-950 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40 block">Alert dispatch threshold</span>
              <div className="flex gap-1.5 bg-zinc-900 border border-white/5 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Alerts' },
                  { id: 'high', label: 'High & Up' },
                  { id: 'critical', label: 'Critical Only' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setUrgencyThreshold(opt.id as any);
                      triggerSuccesState(`Threshold set to ${opt.label}!`);
                    }}
                    className={`flex-1 py-1 px-2 text-[8px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
                      urgencyThreshold === opt.id 
                        ? 'bg-red-600 text-white' 
                        : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-2">
            <button 
              onClick={() => simulateNotification('security')}
              className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> Simulate Security Threat Alert
            </button>
          </div>
        </div>

      </div>

      {/* Simulator Outbox Live Feed Log */}
      {alertsLog.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-zinc-900/60 border border-white/5 rounded-[2rem] space-y-4"
        >
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/40 header-bar">
            <span>📡 Dispatch Simulator Audit Feed</span>
            <span>Last {alertsLog.length} simulated dispatches</span>
          </div>
          
          <div className="space-y-2.5">
            {alertsLog.map((log) => (
              <div key={log.id} className="flex justify-between items-center gap-4 p-3 bg-black/40 border border-white/5 rounded-xl text-[10px] font-mono select-none">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${log.type === 'maintenance' ? 'bg-[#FF5F1F]' : 'bg-red-500'}`} />
                  <span className="font-sans font-black text-white uppercase tracking-wider">{log.title}</span>
                </div>
                <div className="flex-1 text-white/50 truncate font-semibold">
                  {log.body}
                </div>
                <div className="text-white/30">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Static protocol reminder */}
      <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-3 text-[10px] text-white/40 font-semibold uppercase tracking-widest leading-relaxed">
        <Info className="w-4 h-4 text-[#FF5F1F] shrink-0 mt-0.5" />
        <span>Operational Notice: Automations run live on stadium server daemon threads. Setting toggles take effect instantly in real-time. CC is auto-copied as requested in Jordan/Brian governance instructions.</span>
      </div>

    </div>
  );
};

// Simple Close implementation for modular compatibility
const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
