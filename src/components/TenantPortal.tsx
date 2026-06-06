import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  Camera, 
  Trash2, 
  Wind, 
  Clock, 
  Bike,
  CheckCircle2, 
  MessageSquare,
  AlertCircle, 
  Info,
  Send,
  Plus,
  ChevronRight,
  Smartphone,
  Mail,
  Eye,
  Cpu,
  ShieldAlert,
  FileWarning,
  Gavel,
  History as HistoryIcon,
  Wrench,
  LayoutGrid,
  MapPin,
  Hospital,
  Sparkles,
  Package,
  Zap,
  X,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

import { LeaseUpdateWalkthrough } from './LeaseUpdateWalkthrough';
import { db, auth, googleProvider } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

interface UserSettings {
  preferred_notification_time: string;
  sms_enabled: boolean;
  email_enabled: boolean;
}

interface SecurityEvent {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  image_url?: string;
}

interface ConstructionUpdate {
  id: number;
  title: string;
  content: string;
  update_date: string;
}

interface TenantNotice {
  id: number;
  title: string;
  content: string;
  status: string;
  sent_at: string;
  viewed_at?: string;
  acknowledged_at?: string;
}

interface LeaseViolation {
  id: number;
  description: string;
  violation_date: string;
  status: string;
  gm_notes?: string;
}

interface LeaseUpdate {
  id: number;
  year: number;
  status: string;
  walkthrough_completed: number;
  signed_at?: string;
}

export const TenantPortal = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'security' | 'refer' | 'settings' | 'maintenance' | 'mailbox' | 'support' | 'info-nook'>('mailbox');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const q = localStorage.getItem('ruby_offline_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const activeOffline = isOffline || simulateOffline;

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const cached = localStorage.getItem('ruby_settings');
      return cached ? JSON.parse(cached) : {
        preferred_notification_time: '09:00',
        sms_enabled: true,
        email_enabled: true
      };
    } catch {
      return {
        preferred_notification_time: '09:00',
        sms_enabled: true,
        email_enabled: true
      };
    }
  });
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(() => {
    try {
      const cached = localStorage.getItem('ruby_securityEvents');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [constructionUpdates, setConstructionUpdates] = useState<ConstructionUpdate[]>(() => {
    try {
      const cached = localStorage.getItem('ruby_constructionUpdates');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [notices, setNotices] = useState<TenantNotice[]>(() => {
    try {
      const cached = localStorage.getItem('ruby_notices');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [violations, setViolations] = useState<LeaseViolation[]>(() => {
    try {
      const cached = localStorage.getItem('ruby_violations');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('ruby_maintenanceRequests');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [leaseUpdate, setLeaseUpdate] = useState<LeaseUpdate | null>(() => {
    try {
      const cached = localStorage.getItem('ruby_leaseUpdate');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<TenantNotice | null>(null);
  const [referralData, setReferralData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportText, setReportText] = useState('');
  const [showValueAddForm, setShowValueAddForm] = useState(false);
  const [valueAddRequest, setValueAddRequest] = useState({
    description: '',
    type: 'Painting'
  });
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [concernType, setConcernType] = useState('concern');
  const [concernMessage, setConcernMessage] = useState('');
  const [showConcernSuccess, setShowConcernSuccess] = useState(false);

  const [rentStatus, setRentStatus] = useState<{ amount: number, last_payment: string, status: string } | null>(() => {
    try {
      const cached = localStorage.getItem('ruby_rentStatus');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [myConcerns, setMyConcerns] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('ruby_myConcerns');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [mailboxCustomizations, setMailboxCustomizations] = useState<Record<string, { color: string }>>({});
  const [selectedMailbox, setSelectedMailbox] = useState<string | null>(null);
  const [currentUserUnit, setCurrentUserUnit] = useState<string>('101'); // Mocked for demo

  const units = [
    '101', '102', '103', '104', '105', '106',
    '107', '108', '201', '202', '203', '204',
    '301', '302', '303', '304', '305', '306'
  ];

  const curatedColors = [
    { name: 'Ruby Red', value: '#9B111E' },
    { name: 'Giants Orange', value: '#FD5A1E' },
    { name: 'SF Bay Blue', value: '#0077BE' },
    { name: 'Golden Gate Gold', value: '#FFD700' },
    { name: 'Fog Grey', value: '#808080' },
    { name: 'Night Black', value: '#1A1A1A' }
  ];

  useEffect(() => {
    // Auth and Firebase Sync
    let unsubCustom: () => void = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Set unit based on email for trial focus
        if (user.email === 'fsu9913@gmail.com') {
          setCurrentUserUnit('105');
        } else {
          setCurrentUserUnit('101');
        }
      }

      // Sync public customizations
      try {
        unsubCustom();
        unsubCustom = onSnapshot(collection(db, 'mailboxCustomizations'), (snapshot) => {
          const customs: Record<string, { color: string }> = {};
          snapshot.forEach(doc => {
            customs[doc.id] = doc.data() as { color: string };
          });
          setMailboxCustomizations(customs);
        });
      } catch (err) {
        console.warn("Firestore snapshot offline fallback:", err);
      }
    });

    // Highly Resilient Caching Fetcher
    const fetchWithCache = async (url: string, cacheKey: string, setter: (data: any) => void) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setter(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err) {
        console.warn(`Resilient Catch: Failed to fetch ${url}. Loading fallback data from localStorage.`);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setter(JSON.parse(cached));
        }
      }
    };

    // Load and Cache everything securely
    fetchWithCache('/api/user-settings/1', 'ruby_settings', setSettings);
    fetchWithCache('/api/security-events/1', 'ruby_securityEvents', setSecurityEvents);
    fetchWithCache('/api/construction-updates/1', 'ruby_constructionUpdates', setConstructionUpdates);
    fetchWithCache('/api/tenant-notices/1', 'ruby_notices', setNotices);
    fetchWithCache('/api/lease-violations/1', 'ruby_violations', setViolations);
    fetchWithCache('/api/maintenance?unit_id=1', 'ruby_maintenanceRequests', setMaintenanceRequests);
    fetchWithCache('/api/concerns?unit_id=1', 'ruby_myConcerns', setMyConcerns);
    
    // Lease Updates Custom Array Handler
    fetch('/api/lease-updates/1')
      .then(res => {
        if (!res.ok) throw new Error("Lease update fetch failed");
        return res.json();
      })
      .then(data => {
        const lease = data[0] || null;
        setLeaseUpdate(lease);
        localStorage.setItem('ruby_leaseUpdate', JSON.stringify(lease));
      })
      .catch(() => {
        const cached = localStorage.getItem('ruby_leaseUpdate');
        if (cached) setLeaseUpdate(JSON.parse(cached));
      });
    
    // Rent status
    fetchWithCache('/api/tenant-rent/1', 'ruby_rentStatus', setRentStatus);

    // Online/Offline Listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribeAuth();
      unsubCustom();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineQueue = async () => {
    if (activeOffline || offlineQueue.length === 0) return;
    setIsSubmitting(true);
    const updatedQueue = [...offlineQueue];
    const failedItems = [];

    for (const item of updatedQueue) {
      try {
        let endpoint = '';
        if (item.type === 'maintenance') endpoint = '/api/maintenance';
        else if (item.type === 'referral') endpoint = '/api/referrals';
        else if (item.type === 'concern') endpoint = '/api/concerns';
        else if (item.type === 'settings') endpoint = '/api/user-settings/1';

        const method = item.type === 'settings' ? 'PATCH' : 'POST';
        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });

        if (!res.ok) throw new Error('Sync failed');
      } catch (err) {
        console.error('Failed to sync offline item:', item, err);
        failedItems.push(item);
      }
    }

    setOfflineQueue(failedItems);
    localStorage.setItem('ruby_offline_queue', JSON.stringify(failedItems));
    setIsSubmitting(false);

    if (failedItems.length === 0) {
      alert('Your offline submissions have been synchronized successfully!');
      
      const fetchWithCache = async (url: string, cacheKey: string, setter: (data: any) => void) => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setter(data);
            localStorage.setItem(cacheKey, JSON.stringify(data));
          }
        } catch {}
      };
      fetchWithCache('/api/user-settings/1', 'ruby_settings', setSettings);
      fetchWithCache('/api/maintenance?unit_id=1', 'ruby_maintenanceRequests', setMaintenanceRequests);
      fetchWithCache('/api/concerns?unit_id=1', 'ruby_myConcerns', setMyConcerns);
    }
  };

  useEffect(() => {
    if (!activeOffline) {
      syncOfflineQueue();
    }
  }, [activeOffline]);

  const fetchLeaseUpdate = () => {
    fetch('/api/lease-updates/1')
      .then(res => res.json())
      .then(data => {
        const lease = data[0] || null;
        setLeaseUpdate(lease);
        localStorage.setItem('ruby_leaseUpdate', JSON.stringify(lease));
      })
      .catch(() => {
        const cached = localStorage.getItem('ruby_leaseUpdate');
        if (cached) setLeaseUpdate(JSON.parse(cached));
      });
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('ruby_settings', JSON.stringify(updated));

    if (activeOffline) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'settings',
        description: 'Updated notification settings offline',
        payload: newSettings,
        timestamp: new Date().toLocaleString()
      };
      const newQueue = [...offlineQueue, newItem];
      setOfflineQueue(newQueue);
      localStorage.setItem('ruby_offline_queue', JSON.stringify(newQueue));
      return;
    }

    await fetch('/api/user-settings/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
  };

  const handleReferFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      tenant_id: 1,
      friend_name: referralData.name,
      friend_email: referralData.email
    };

    if (activeOffline) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'referral',
        description: `Referral of ${referralData.name} (${referralData.email})`,
        payload,
        timestamp: new Date().toLocaleString()
      };
      const newQueue = [...offlineQueue, newItem];
      setOfflineQueue(newQueue);
      localStorage.setItem('ruby_offline_queue', JSON.stringify(newQueue));
      alert('Offline Mode Active: Referral saved locally inside the Outbox!');
      setReferralData({ name: '', email: '' });
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Referral sent! Thank you for sharing the Ruby Soul.');
      setReferralData({ name: '', email: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReport = async () => {
    if (!reportText.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setReportText('');
      setShowReportSuccess(true);
      setTimeout(() => setShowReportSuccess(false), 3000);
    }, 1000);
  };

  const handleViewNotice = async (notice: TenantNotice) => {
    setSelectedNotice(notice);
    if (activeOffline) return;
    if (notice.status === 'Sent') {
      await fetch(`/api/tenant-notices/${notice.id}/view`, { method: 'PATCH' });
      fetch('/api/tenant-notices/1').then(res => res.json()).then(data => {
        setNotices(data);
        localStorage.setItem('ruby_notices', JSON.stringify(data));
      });
    }
  };

  const handleAcknowledgeNotice = async (noticeId: number) => {
    if (activeOffline) {
      alert("Notice acknowledgments require an active connection to solidify legal agreements on the stadium servers.");
      return;
    }
    setIsSubmitting(true);
    try {
      await fetch(`/api/tenant-notices/${noticeId}/acknowledge`, { method: 'PATCH' });
      fetch('/api/tenant-notices/1').then(res => res.json()).then(data => {
        setNotices(data);
        localStorage.setItem('ruby_notices', JSON.stringify(data));
      });
      setSelectedNotice(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleUpdateMailboxColor = async (unit: string, color: string) => {
    if (unit !== currentUserUnit) return;

    if (!auth.currentUser) {
      alert("Please sign in to save your customizations.");
      return;
    }

    try {
      await setDoc(doc(db, 'mailboxCustomizations', unit), { unit, color });
      await setDoc(doc(db, 'userSettings', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        unit,
        mailboxColor: color
      }, { merge: true });
    } catch (err) {
      console.error("Failed to save mailbox color:", err);
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      unit_id: 1,
      description: reportText,
      photo_url: ''
    };

    if (activeOffline) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'maintenance',
        description: `Maintenance Request: ${reportText.substring(0, 30)}...`,
        payload,
        timestamp: new Date().toLocaleString()
      };
      const newQueue = [...offlineQueue, newItem];
      setOfflineQueue(newQueue);
      localStorage.setItem('ruby_offline_queue', JSON.stringify(newQueue));
      setReportText('');
      setShowReportSuccess(true);
      
      const currentRequests = [...maintenanceRequests];
      currentRequests.unshift({
        id: 'temp-' + newItem.id,
        description: reportText,
        status: 'Offline Pending Sync',
        created_at: new Date().toISOString()
      });
      setMaintenanceRequests(currentRequests);
      localStorage.setItem('ruby_maintenanceRequests', JSON.stringify(currentRequests));

      setTimeout(() => setShowReportSuccess(false), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setReportText('');
      setShowReportSuccess(true);
      fetch('/api/maintenance?unit_id=1').then(res => res.json()).then(data => {
        setMaintenanceRequests(data);
        localStorage.setItem('ruby_maintenanceRequests', JSON.stringify(data));
      });
      setTimeout(() => setShowReportSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValueAddSubmit = async () => {
    if (!valueAddRequest.description) return;
    const payload = {
      unit_id: 1,
      description: `[VALUE-ADD: ${valueAddRequest.type}] ${valueAddRequest.description}`,
      is_value_add: 1,
      photo_url: ''
    };

    if (activeOffline) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'maintenance',
        description: `Value-Add [${valueAddRequest.type}]: ${valueAddRequest.description.substring(0, 30)}...`,
        payload,
        timestamp: new Date().toLocaleString()
      };
      const newQueue = [...offlineQueue, newItem];
      setOfflineQueue(newQueue);
      localStorage.setItem('ruby_offline_queue', JSON.stringify(newQueue));
      setValueAddRequest({ description: '', type: 'Painting' });
      setShowValueAddForm(false);
      setShowReportSuccess(true);

      const currentRequests = [...maintenanceRequests];
      currentRequests.unshift({
        id: 'temp-' + newItem.id,
        description: payload.description,
        is_value_add: 1,
        status: 'Offline Pending Sync',
        created_at: new Date().toISOString()
      });
      setMaintenanceRequests(currentRequests);
      localStorage.setItem('ruby_maintenanceRequests', JSON.stringify(currentRequests));

      setTimeout(() => setShowReportSuccess(false), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setValueAddRequest({ description: '', type: 'Painting' });
      setShowValueAddForm(false);
      setShowReportSuccess(true);
      fetch('/api/maintenance?unit_id=1').then(res => res.json()).then(data => {
        setMaintenanceRequests(data);
        localStorage.setItem('ruby_maintenanceRequests', JSON.stringify(data));
      });
      setTimeout(() => setShowReportSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitConcern = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      unit_id: 1,
      type: concernType,
      message: concernMessage
    };

    if (activeOffline) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'concern',
        description: `Concern: ${concernMessage.substring(0, 30)}...`,
        payload,
        timestamp: new Date().toLocaleString()
      };
      const newQueue = [...offlineQueue, newItem];
      setOfflineQueue(newQueue);
      localStorage.setItem('ruby_offline_queue', JSON.stringify(newQueue));
      
      const currentConcerns = [...myConcerns];
      currentConcerns.unshift({
        id: 'temp-' + newItem.id,
        type: concernType,
        message: concernMessage,
        status: 'Offline Pending Sync',
        created_at: new Date().toISOString()
      });
      setMyConcerns(currentConcerns);
      localStorage.setItem('ruby_myConcerns', JSON.stringify(currentConcerns));

      setShowConcernSuccess(true);
      setConcernMessage('');
      setTimeout(() => setShowConcernSuccess(false), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/concerns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      fetch('/api/concerns?unit_id=1').then(res => res.json()).then(data => {
        setMyConcerns(data);
        localStorage.setItem('ruby_myConcerns', JSON.stringify(data));
      });
      setShowConcernSuccess(true);
      setConcernMessage('');
      setTimeout(() => setShowConcernSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting concern:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Portal Navigation - Available to all authorized tenants */}
      {activeTab !== 'mailbox' && (
        <div className="flex gap-8 border-b border-app-border overflow-x-auto pb-px">
          {[
            { id: 'mailbox', label: 'Mailbox Hub', icon: Mail },
            { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
            { id: 'info-nook', label: 'Info Nook', icon: Info },
            { id: 'support', label: 'Support Hub', icon: MessageSquare },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'refer', label: 'Refer a Friend', icon: Users },
            { id: 'settings', label: 'Notifications', icon: Bell }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <motion.div layoutId="activeTenantTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
            </button>
          ))}
        </div>
      )}

      {/* Offline Status & Local Cache Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white/5 backdrop-blur-md border border-app-border rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className={`block h-3 w-3 rounded-full ${activeOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {activeOffline && (
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75 animate-ping -top-0 -left-0" />
            )}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-[#FF5F1F] flex items-center gap-1.5">
              {activeOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                  Offline Mode Active
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  Rent-Ruby Cache Synchronized
                </>
              )}
            </div>
            <p className="text-[10px] text-app-text/50 uppercase tracking-widest font-semibold mt-0.5">
              {activeOffline 
                ? 'Displaying contract details & notifications safely from localStorage cache.' 
                : 'All lease documents, notices, and smart-bin rules are held securely on-device.'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {offlineQueue.length > 0 && (
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse">
              {offlineQueue.length} Pending Actions
            </div>
          )}
          
          <button
            onClick={() => setSimulateOffline(!simulateOffline)}
            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
              simulateOffline 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            {simulateOffline ? 'Disable Simulation' : 'Simulate Offline'}
          </button>
        </div>
      </div>

      {activeOffline && offlineQueue.length > 0 && (
        <div className="p-6 bg-amber-500/5 border border-amber-500/15 rounded-[2rem] space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Outbox (Waiting to go online)
            </h5>
            <button 
              onClick={() => {
                setOfflineQueue([]);
                localStorage.removeItem('ruby_offline_queue');
              }}
              className="text-[9px] font-black text-ruby uppercase tracking-widest hover:underline"
            >
              Clear Queue
            </button>
          </div>
          <div className="divide-y divide-amber-500/10">
            {offlineQueue.map((item, i) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-app-text font-mono uppercase tracking-widest border border-app-border px-1.5 py-0.5 rounded mr-2 bg-white/20">
                    {item.type}
                  </span>
                  <span className="text-app-text/70">{item.description}</span>
                </div>
                <span className="text-[8px] font-mono text-app-text/40">{item.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showWalkthrough && (
          <LeaseUpdateWalkthrough 
            tenantId={1} 
            onClose={() => setShowWalkthrough(false)}
            onComplete={() => {
              setShowWalkthrough(false);
              fetchLeaseUpdate();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === 'mailbox' && (
          <motion.div
            key="mailbox"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative min-h-[800px] rounded-[4rem] overflow-hidden shadow-2xl bg-[#2A1810] group"
          >
            {/* Background: Dark Warm Tone */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0A] via-[#2A1810] to-[#3D2314]"></div>
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>
            </div>

            {/* Stadium Architecture Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              {/* The "Field" */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[40%] bg-[#3D2314]/40 rounded-[100%] blur-3xl transform -rotate-2"></div>
              {/* Stadium Arches */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent flex justify-around px-20">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-16 h-full border-x border-white/5 rounded-b-full"></div>
                ))}
              </div>
            </div>

            {/* Giants Stadium Rows Layout */}
            <div className="relative z-10 h-full flex flex-col items-center justify-start pt-20 p-12">
              <div className="text-center mb-16">
                <h2 className="text-6xl font-black text-white tracking-tighter uppercase">
                  Ruby <span className="italic text-ruby">Stadium Hub</span>.
                </h2>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-[0.4em]">3 Rows Behind Home Plate • Looking Out at the Bay</p>
                  <button 
                    onClick={() => setPrivacyMode(!privacyMode)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${privacyMode ? 'bg-ruby text-white border-ruby' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'}`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{privacyMode ? 'Privacy Active' : 'Solidify Privacy'}</span>
                  </button>
                </div>
              </div>

              <div className="relative w-full max-w-5xl flex flex-col gap-12 items-center">
                {[0, 1, 2].map((rowIdx) => (
                  <div 
                    key={rowIdx} 
                    className={`flex gap-6 justify-center transition-all duration-700 ${
                      rowIdx === 0 ? 'scale-110 z-30' : rowIdx === 1 ? 'scale-100 z-20 opacity-80' : 'scale-90 z-10 opacity-60'
                    }`}
                  >
                    {units.slice(rowIdx * 6, (rowIdx + 1) * 6).map((unit, idx) => {
                      const custom = mailboxCustomizations[unit] || { color: '#ffffff10' };
                      const isCurrentUser = unit === currentUserUnit;

                      return (
                        <motion.button
                          key={unit}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (rowIdx * 6 + idx) * 0.03 }}
                          onClick={() => setSelectedMailbox(unit)}
                          style={{ 
                            backgroundColor: (privacyMode && !isCurrentUser) ? '#1A1A1A' : custom.color,
                            borderColor: isCurrentUser ? '#A64B4B' : 'rgba(255,255,255,0.1)'
                          }}
                          className={`w-20 h-24 rounded-t-2xl rounded-b-lg border-2 flex flex-col items-center justify-center transition-all hover:scale-110 hover:shadow-[0_0_40px_rgba(166,75,75,0.4)] group relative shadow-2xl ${isCurrentUser ? 'ring-4 ring-ruby/30' : ''}`}
                        >
                          {(privacyMode && !isCurrentUser) && (
                            <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] rounded-t-2xl rounded-b-lg flex items-center justify-center">
                              <ShieldCheck className="w-4 h-4 text-white/20" />
                            </div>
                          )}
                          <div className="text-[8px] font-black text-white/40 mb-1">UNIT</div>
                          <div className="text-2xl font-black text-white tracking-tighter">{unit}</div>
                          
                          {/* Stadium Seat Detail */}
                          <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/10 rounded-full"></div>
                          
                          {/* Flag visual */}
                          <div className="absolute -right-1 top-4 w-1.5 h-8 bg-ruby rounded-full origin-bottom transition-transform group-hover:rotate-45" />
                          
                          {isCurrentUser && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                              <div className="px-3 py-1 bg-ruby text-white text-[8px] font-bold rounded-full whitespace-nowrap animate-bounce shadow-lg">
                                HOME PLATE
                              </div>
                              {unit === '105' && (
                                <div className="px-2 py-0.5 bg-app-accent text-white text-[6px] font-black rounded-full uppercase tracking-widest shadow-sm">
                                  Trial Focus
                                </div>
                              )}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Contact & Map Info */}
              <div className="mt-20 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center text-center hover:bg-white/10 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-app-accent/20 flex items-center justify-center mb-3">
                    <Smartphone className="w-5 h-5 text-app-accent" />
                  </div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Management</div>
                  <div className="text-sm font-black text-white">(510) 555-0199</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center text-center hover:bg-white/10 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-app-accent/20 flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5 text-app-accent" />
                  </div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Email Us</div>
                  <div className="text-sm font-black text-white">hello@3875ruby.com</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center text-center hover:bg-white/10 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-app-accent/20 flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5 text-app-accent" />
                  </div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Location</div>
                  <div className="text-sm font-black text-white">3875 Ruby St, Oakland</div>
                </div>
              </div>

              {/* Quick Links Overlay when a mailbox is selected */}
              <AnimatePresence>
                {selectedMailbox && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[#0B1A2D]/95 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-2xl border border-white/10 z-50"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-5">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-colors duration-500"
                          style={{ backgroundColor: mailboxCustomizations[selectedMailbox]?.color || '#1A1A1A' }}
                        >
                          <Mail className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Unit {selectedMailbox} Portal</h3>
                          <p className="text-[10px] font-bold text-[#FD5A1E] uppercase tracking-widest">Secure Stadium Access</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedMailbox(null)} className="p-3 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-white/40" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedMailbox === '105' ? (
                        <>
                          {[
                            { id: 'dashboard', label: 'Balance', icon: CreditCard, color: 'bg-ruby/10 text-ruby' },
                            { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'bg-[#FD5A1E]/10 text-[#FD5A1E]' },
                            { id: 'dashboard', label: 'Notices', icon: Bell, color: 'bg-[#FD5A1E]/10 text-[#FD5A1E]' },
                          ].map((link) => (
                            <button
                              key={link.label}
                              onClick={() => {
                                setActiveTab(link.id as any);
                                setSelectedMailbox(null);
                              }}
                              className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-[#FD5A1E]/30 transition-all group text-center"
                            >
                              <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                                <link.icon className="w-6 h-6" />
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">{link.label}</div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="col-span-full p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/10 text-center space-y-4">
                          <ShieldCheck className="w-12 h-12 text-white/10 mx-auto" />
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] leading-relaxed">
                            Digital access restricted for privacy.<br/>
                            This unit's portal is currently locked for the trial period.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Customization Option - Only for current user */}
                    {selectedMailbox === currentUserUnit && (
                      <div className="mt-10 pt-10 border-t border-white/10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#FD5A1E]" />
                            <div className="text-xs font-bold text-white/60 uppercase tracking-widest">
                              {auth.currentUser ? 'Paint Your Mailbox' : 'Sign in to Paint'}
                            </div>
                          </div>
                          {auth.currentUser ? (
                            <button 
                              onClick={handleLogout}
                              className="text-[8px] font-bold text-white/20 uppercase tracking-widest hover:text-white/40 transition-colors"
                            >
                              Sign Out ({auth.currentUser.email})
                            </button>
                          ) : (
                            <button 
                              onClick={handleLogin}
                              disabled={isSubmitting}
                              className="px-4 py-1 bg-app-accent text-white text-[8px] font-bold uppercase tracking-widest rounded-full hover:opacity-90 transition-all"
                            >
                              {isSubmitting ? 'Signing in...' : 'Sign in with Google'}
                            </button>
                          )}
                        </div>
                        {auth.currentUser && (
                          <div className="flex justify-between items-center bg-white/5 p-4 rounded-3xl">
                            <div className="flex gap-3">
                              {curatedColors.map(color => (
                                <button
                                  key={color.value}
                                  onClick={() => handleUpdateMailboxColor(selectedMailbox, color.value)}
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                  className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${mailboxCustomizations[selectedMailbox]?.color === color.value ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-transparent'}`}
                                />
                              ))}
                            </div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-tighter italic">Giants Edition</div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === 'info-nook' && (
          <motion.div
            key="info-nook"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-app-accent/10 rounded-2xl">
                    <Info className="w-6 h-6 text-app-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-app-text uppercase tracking-tighter">The Info Nook</h3>
                    <p className="text-app-text/40 text-sm mt-1 uppercase tracking-widest font-bold">Essential forms, guides, and building knowledge.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Move-Out Checklist */}
                  <div className="p-8 rounded-3xl bg-app-bg border border-app-border hover:border-app-accent/40 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-ruby/10 text-ruby rounded-xl">
                        <FileWarning className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-ruby uppercase tracking-widest px-3 py-1 bg-ruby/5 rounded-full">Required</span>
                    </div>
                    <h4 className="text-xl font-bold text-app-text uppercase tracking-tight mb-2">Move-Out Checklist</h4>
                    <p className="text-xs text-app-text/60 leading-relaxed mb-6">
                      Ensure a smooth transition and full security deposit return by following our 2026 move-out protocols.
                    </p>
                    <button className="w-full py-4 bg-app-text text-app-bg rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-app-accent hover:text-white transition-all flex items-center justify-center gap-2">
                      <Package className="w-4 h-4" /> Download Checklist
                    </button>
                  </div>

                  {/* Building Rules */}
                  <div className="p-8 rounded-3xl bg-app-bg border border-app-border hover:border-app-accent/40 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-app-accent/10 text-app-accent rounded-xl">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-app-text uppercase tracking-tight mb-2">Building Rules 2026</h4>
                    <p className="text-xs text-app-text/60 leading-relaxed mb-6">
                      Updated rules regarding quiet hours, guest policies, and AI security camera protocols.
                    </p>
                    <button className="w-full py-4 border border-app-border text-app-text rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-app-text hover:text-app-bg transition-all">
                      View Digital Handbook
                    </button>
                  </div>

                  {/* Parking & Transit */}
                  <div className="p-8 rounded-3xl bg-app-bg border border-app-border hover:border-app-accent/40 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <MapPin className="w-6 h-6" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-app-text uppercase tracking-tight mb-2">Parking & Transit Map</h4>
                    <p className="text-xs text-app-text/60 leading-relaxed mb-6">
                      Map of assigned parking stalls, EV charging stations, and MacArthur BART walking paths.
                    </p>
                    <button className="w-full py-4 border border-app-border text-app-text rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-app-text hover:text-app-bg transition-all">
                      Open Interactive Map
                    </button>
                  </div>

                  {/* Trash & Recycling Schedule */}
                  <div className="p-8 rounded-3xl bg-app-bg border border-app-border hover:border-app-accent/40 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                        <Trash2 className="w-6 h-6" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-app-text uppercase tracking-tight mb-2">Trash & Eco Guide</h4>
                    <p className="text-xs text-app-text/60 leading-relaxed mb-6">
                      Schedule for pickup and guide for our new AI-monitored smart sorting bins.
                    </p>
                    <button className="w-full py-4 border border-app-border text-app-text rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-app-text hover:text-app-bg transition-all">
                      Pickup Schedule
                    </button>
                  </div>

                  {/* Bike Room */}
                  <div className="p-8 rounded-3xl bg-app-bg border border-app-border hover:border-app-accent/40 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-app-accent/10 text-app-accent rounded-xl">
                        <Bike className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-app-accent uppercase tracking-widest px-3 py-1 bg-app-accent/5 rounded-full">Secure</span>
                    </div>
                    <h4 className="text-xl font-bold text-app-text uppercase tracking-tight mb-2">Secure Bike Room</h4>
                    <p className="text-xs text-app-text/60 leading-relaxed mb-6">
                      Access our monitored indoor bike storage. Key-card entry and 24/7 high-definition surveillance.
                    </p>
                    <button className="w-full py-4 border border-app-border text-app-text rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-app-text hover:text-app-bg transition-all">
                      Access Key Card
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-8 rounded-[2.5rem] bg-app-text text-app-bg shadow-2xl">
                <h4 className="text-xl font-bold uppercase tracking-tight mb-4">Quick Forms</h4>
                <div className="space-y-4">
                  {[
                    { name: 'Sublet Request Form', desc: 'Required 30 days prior' },
                    { name: 'Pet Registration', desc: 'SB 1170 Compliance' },
                    { name: 'Maint. Pre-Qualification', desc: 'Diagnostic steps' },
                    { name: 'Key Replacement', desc: 'Smart Hub access' },
                    { name: 'Intent to Vacate', desc: '30-day notice' }
                  ].map((form) => (
                    <button 
                      key={form.name}
                      className="w-full p-6 rounded-2xl bg-app-bg/10 border border-app-bg/10 flex items-center justify-between hover:bg-app-bg/20 transition-all group"
                    >
                      <div className="text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-1">{form.name}</span>
                        <span className="text-[8px] font-bold text-app-bg/40 uppercase tracking-widest">{form.desc}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-app-accent group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-ruby/5 border border-ruby/10">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-5 h-5 text-ruby" />
                  <h4 className="font-bold text-ruby text-xs uppercase tracking-widest">Privacy & Safety</h4>
                </div>
                <p className="text-[10px] text-app-text/60 leading-relaxed italic">
                  All correspondence is timestamped and logged for safety. Your privacy is solidified through our secure stadium hub.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'support' && (
          <motion.div
            key="support"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="p-12 rounded-[3rem] bg-app-card border border-app-border shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                  <h3 className="text-4xl font-black text-app-text uppercase tracking-tighter">Support <span className="italic text-app-accent">Hub</span>.</h3>
                  <p className="text-app-text/40 text-sm mt-2 uppercase tracking-widest font-bold">Direct line to GM Mezfin & Management.</p>
                </div>
                <div className="p-6 rounded-3xl bg-ruby/5 border border-ruby/10 text-right">
                  <div className="text-[10px] font-black text-ruby uppercase tracking-widest mb-1">Emergency 24/7</div>
                  <div className="text-2xl font-black text-app-text">(510) 555-9111</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-8 rounded-[2rem] bg-app-bg border border-app-border space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-app-accent/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-app-accent" />
                    </div>
                    <h4 className="text-xl font-bold uppercase tracking-tight">AI Concierge</h4>
                    <p className="text-sm text-app-text/60 leading-relaxed">
                      Our AI agent can answer questions about building policies, local amenities, and lease terms instantly.
                    </p>
                    <button className="w-full py-3 bg-app-text text-app-bg rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">
                      Chat with Ruby AI
                    </button>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-app-bg border border-app-border space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-ruby/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-ruby" />
                    </div>
                    <h4 className="text-xl font-bold uppercase tracking-tight">Direct Email</h4>
                    <p className="text-sm text-app-text/60 leading-relaxed">
                      Prefer email? Send your concerns directly to our management team.
                    </p>
                    <a href="mailto:mezfin@3875ruby.com" className="block w-full py-3 border border-ruby/20 text-ruby text-center rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-ruby/5 transition-all">
                      mezfin@3875ruby.com
                    </a>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-app-text text-app-bg shadow-2xl space-y-8">
                  <h4 className="text-2xl font-bold uppercase tracking-tight">Submit a Concern</h4>
                  <form onSubmit={handleSubmitConcern} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-app-bg/40 ml-4">Issue Type</label>
                      <select 
                        value={concernType}
                        onChange={(e) => setConcernType(e.target.value)}
                        className="w-full px-6 py-4 bg-app-bg/5 border border-app-bg/10 rounded-2xl focus:outline-none focus:border-app-accent/40 transition-all text-sm"
                      >
                        <option value="concern">General Concern</option>
                        <option value="question">Question</option>
                        <option value="suggestion">Suggestion</option>
                        <option value="complaint">Complaint</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-app-bg/40 ml-4">Message</label>
                      <textarea 
                        required
                        value={concernMessage}
                        onChange={(e) => setConcernMessage(e.target.value)}
                        placeholder="What's on your mind? Mezfin will review this personally."
                        className="w-full px-6 py-4 bg-app-bg/5 border border-app-bg/10 rounded-2xl focus:outline-none focus:border-app-accent/40 transition-all text-sm min-h-[200px] resize-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting || !concernMessage.trim()}
                      className="w-full py-5 bg-app-accent text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg uppercase tracking-widest disabled:opacity-50"
                    >
                      {isSubmitting ? 'Sending...' : 'Send to Management'}
                    </button>
                    {showConcernSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-1"
                      >
                        <div className="text-xs font-bold text-app-accent uppercase tracking-widest">Concern Logged Successfully</div>
                        <div className="text-[8px] text-app-bg/40 font-mono uppercase tracking-widest">Timestamped: {new Date().toLocaleString()} // Secure</div>
                      </motion.div>
                    )}
                  </form>
                </div>
              </div>

              {myConcerns.length > 0 && (
                <div className="mt-12 pt-12 border-t border-app-border">
                  <h4 className="text-2xl font-black text-app-text tracking-tighter uppercase mb-8">My Past Concerns</h4>
                  <div className="space-y-4">
                    {myConcerns.map((concern) => (
                      <div key={concern.id} className="p-6 rounded-[2rem] bg-app-bg border border-app-border flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${concern.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : concern.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-ruby/10 text-ruby'}`}>
                              {concern.status}
                            </span>
                            <span className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">{new Date(concern.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-medium text-app-text">"{concern.message}"</p>
                        </div>
                        
                        {(concern.gm_notes_to_tenant || concern.assigned_staff) && (
                          <div className="flex-1 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex gap-4">
                            <div className="p-2 rounded-full bg-emerald-100/50 text-emerald-600 h-fit">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-black tracking-widest uppercase text-emerald-800">Message from Mezfin</h5>
                              {concern.assigned_staff && (
                                <p className="text-xs text-emerald-700 font-bold">Assigned to: {concern.assigned_staff}</p>
                              )}
                              {concern.gm_notes_to_tenant && (
                                <p className="text-sm text-emerald-900 italic">"{concern.gm_notes_to_tenant}"</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Rent Status Card */}
            <div className="lg:col-span-2 space-y-8">
              {/* Lease Update Banner */}
              {leaseUpdate?.status === 'Pending' && (
                <div className="p-8 rounded-[2.5rem] bg-app-card border border-app-border text-app-text shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-24 h-24" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="p-4 bg-app-accent rounded-2xl">
                      <FileWarning className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <h4 className="text-2xl font-black uppercase tracking-tighter">2026 Lease Update <span className="italic text-app-accent">Required</span></h4>
                      <p className="text-sm text-app-text/50 mt-1 leading-relaxed">
                        Review your updated tenant rights, building features, and sign your 2026 lease agreement.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowWalkthrough(true)}
                      className="px-8 py-4 bg-app-accent text-white rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                    >
                      Start Walkthrough
                    </button>
                  </div>
                </div>
              )}

              {/* Sublease Reminder Banner */}
              <div className="p-6 rounded-[2rem] bg-app-accent/5 border border-app-accent/10 flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-app-accent/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-app-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-app-text text-sm uppercase tracking-widest">Sublease Policy Reminder</h4>
                  <p className="text-xs text-app-text/60 leading-relaxed">
                    Subleasing is strictly prohibited without written consent. Unauthorized guests staying longer than 14 days may trigger a lease violation.
                  </p>
                </div>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-app-text uppercase tracking-tighter">Rent Status</h3>
                    <p className="text-app-text/40 text-sm mt-1 uppercase tracking-widest font-bold">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                    rentStatus?.status === 'Paid' ? 'bg-ruby/10 text-ruby' : 'bg-ruby-light/10 text-ruby-light'
                  }`}>
                    {rentStatus?.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />} 
                    {rentStatus?.status || 'Loading...'}
                  </div>
                </div>
                
                <div className="flex items-end gap-4 mb-8">
                  <div className="text-5xl font-black text-app-text tracking-tighter">
                    ${rentStatus?.amount?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm font-bold text-app-text/30 mb-2 uppercase tracking-widest">
                    {rentStatus?.last_payment ? `Last payment: ${new Date(rentStatus.last_payment).toLocaleDateString()}` : 'No recent payments'}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 p-4 rounded-2xl bg-app-text/5 hover:bg-app-text/10 transition-colors flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest">
                    <CreditCard className="w-4 h-4" /> View Ledger
                  </button>
                  <button 
                    onClick={() => {
                        alert("Initiating Chase Direct Deposit sync...");
                        setTimeout(() => alert("Chase Payment Processing started."), 1000);
                    }}
                    className="flex-1 p-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-xl uppercase tracking-widest"
                  >
                    <RefreshCw className="w-4 h-4" /> Chase QuickPay
                  </button>
                  <button 
                    onClick={() => window.open(`https://pay.silverbackai.agency/ruby-${currentUserUnit}`, '_blank')}
                    className="flex-1 p-4 rounded-2xl bg-app-accent text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-md uppercase tracking-widest"
                  >
                    <CreditCard className="w-4 h-4" /> {rentStatus?.status === 'Paid' ? 'Stripe Pre-pay' : 'Pay via Stripe'}
                  </button>
                </div>
              </div>

              {/* Recent Notices Preview */}
              <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-app-text uppercase tracking-tighter">Recent Notices</h3>
                </div>
                <div className="space-y-4">
                  {notices.slice(0, 2).map((notice) => (
                    <div 
                      key={notice.id} 
                      onClick={() => handleViewNotice(notice)}
                      className="p-4 rounded-2xl bg-app-text/[0.02] border border-app-text/5 hover:border-app-accent/20 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${notice.status === 'Acknowledged' ? 'bg-ruby/10 text-ruby' : 'bg-app-accent/10 text-app-accent'}`}>
                          <FileWarning className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-app-text uppercase tracking-tight">{notice.title}</div>
                          <div className="text-[9px] font-bold text-app-text/30 uppercase tracking-widest">
                            {new Date(notice.sent_at).toLocaleDateString()} • {notice.status}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-app-text/10 group-hover:text-app-accent transition-colors" />
                    </div>
                  ))}
                  {notices.length === 0 && (
                    <p className="text-sm text-app-text/30 italic">No recent notices.</p>
                  )}
                </div>
              </div>

              {/* Construction Updates */}
              <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-app-text uppercase tracking-tighter">Building Updates</h3>
                  <div className="p-2 bg-app-text/5 rounded-full">
                    <Info className="w-5 h-5 text-app-text/20" />
                  </div>
                </div>
                <div className="space-y-6">
                  {constructionUpdates.map((update) => (
                    <div key={update.id} className="p-6 rounded-3xl bg-app-text/[0.02] border border-app-border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-app-text uppercase tracking-tight">{update.title}</h4>
                        <span className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">{new Date(update.update_date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-app-text/60 leading-relaxed">{update.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Healthcare Professional Suite */}
              <div className="p-10 rounded-[2.5rem] bg-ruby/5 border border-ruby/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Hospital className="w-32 h-32 text-ruby" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ruby/10 border border-ruby/20 text-ruby text-[10px] font-black uppercase tracking-widest mb-6">
                    <Sparkles className="w-3 h-3" /> Healthcare Professional Suite
                  </div>
                  <h3 className="text-3xl font-black text-app-text uppercase tracking-tighter leading-none mb-4">
                    Tailored for <span className="italic text-ruby">Night Shift</span> & Beyond.
                  </h3>
                  <p className="text-sm text-app-text/60 leading-relaxed mb-8 max-w-md">
                    We understand the demands of healthcare. Our specialized suite ensures your home is a sanctuary, no matter your schedule.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/50 border border-ruby/5 space-y-2">
                      <div className="flex items-center gap-2 text-ruby">
                        <Wind className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Quiet Hours</span>
                      </div>
                      <p className="text-[10px] text-app-text/50">Request extended quiet hours for day-time sleeping.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/50 border border-ruby/5 space-y-2">
                      <div className="flex items-center gap-2 text-ruby">
                        <Package className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Secure Delivery</span>
                      </div>
                      <p className="text-[10px] text-app-text/50">Priority package handling for high-value deliveries.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Schedule */}
            <div className="space-y-8">
              <div className="p-8 rounded-[2.5rem] bg-app-card border border-app-border text-app-text shadow-xl relative overflow-hidden">
                {/* Secure Chip Visual */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Cpu className="w-24 h-24" />
                </div>
                
                <h3 className="text-xl font-black mb-6 relative z-10 uppercase tracking-tighter">Community Schedule</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-app-text/5 flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-app-accent" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Trash Day</div>
                      <div className="font-bold uppercase tracking-tight">Every Tuesday</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-app-text/5 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-ruby" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Active Security</div>
                      <div className="font-bold uppercase tracking-tight">AI-Monitored 24/7</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-app-text/5 flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-app-text/40 uppercase tracking-widest">On-Site Team</div>
                      <div className="font-bold uppercase tracking-tight">Response Guaranteed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-app-text/5 flex items-center justify-center">
                      <Bike className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Bike Storage</div>
                      <div className="font-bold uppercase tracking-tight">Secure Indoors</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-app-text/5 flex items-center justify-center">
                      <Wind className="w-6 h-6 text-ruby" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Street Sweeping</div>
                      <div className="font-bold uppercase tracking-tight">2nd & 4th Thursday</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-app-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-app-text/40 uppercase tracking-widest">SMS Alerts</span>
                    <div className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${settings.sms_enabled ? 'bg-app-accent' : 'bg-app-text/10'}`} onClick={() => handleUpdateSettings({ sms_enabled: !settings.sms_enabled })}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.sms_enabled ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>
                  <p className="text-[10px] text-app-text/30 leading-relaxed italic">
                    Receive a text at {settings.preferred_notification_time} on the morning of scheduled services.
                  </p>
                </div>
              </div>              <div className="p-8 rounded-[2.5rem] bg-app-accent/5 border border-app-accent/10">
                <h3 className="text-xl font-black text-app-accent mb-4 uppercase tracking-tighter">Refer a Friend</h3>
                <p className="text-sm text-app-text/70 mb-6 leading-relaxed">
                  Love living at Ruby? Refer a friend and get <span className="font-bold text-app-accent">$250 off</span> your next month's rent when they sign a lease.
                </p>
                <button 
                  onClick={() => setActiveTab('refer')}
                  className="w-full py-3 bg-app-accent text-white rounded-full font-bold text-sm hover:opacity-90 transition-all uppercase tracking-widest"
                >
                  Start Referring
                </button>
              </div>

              {/* See Something Say Something */}
              <div className="p-8 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-app-accent" />
                  <h3 className="text-xl font-black text-app-text uppercase tracking-tighter">See Something?</h3>
                </div>
                <p className="text-xs text-app-text/50 leading-relaxed italic">
                  Report security concerns or maintenance issues anonymously. Our new recognition cameras monitor for unauthorized patterns.
                </p>
                <div className="space-y-4">
                  <textarea 
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Describe what you saw..."
                    className="w-full p-4 bg-app-bg border border-app-border rounded-2xl text-xs text-app-text focus:outline-none focus:ring-1 focus:ring-app-accent/20 min-h-[100px] resize-none"
                  />
                  <button 
                    onClick={handleSendReport}
                    disabled={isSubmitting || !reportText.trim()}
                    className="w-full py-3 bg-app-accent text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Secure Report'}
                  </button>
                  {showReportSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-1"
                    >
                      <div className="text-[10px] font-bold text-ruby uppercase tracking-widest">Report Sent Securely</div>
                      <div className="text-[8px] text-app-text/30 font-mono uppercase tracking-widest">Safety Logged: {new Date().toLocaleString()}</div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}



        {activeTab === 'maintenance' && (
          <motion.div
            key="maintenance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              {/* Value-Add Requests (Thumbtack style) */}
              <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-app-text uppercase tracking-tight">Value-Add Upgrades</h4>
                      <p className="text-[10px] text-app-text/40 font-bold uppercase tracking-widest">"Thumbtack" Style Customizations</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowValueAddForm(!showValueAddForm)}
                    className="px-6 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {showValueAddForm ? 'Cancel' : 'Request Upgrade'}
                  </button>
                </div>

                {showValueAddForm ? (
                  <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest ml-4">Upgrade Type</label>
                        <select 
                          value={valueAddRequest.type}
                          onChange={(e) => setValueAddRequest({ ...valueAddRequest, type: e.target.value })}
                          className="w-full px-6 py-4 bg-app-text/5 border border-app-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-app-text"
                        >
                          <option value="Painting">Painting Bedroom</option>
                          <option value="Mirror">New Mirror Installation</option>
                          <option value="Ceiling Fan">Add Ceiling Fan</option>
                          <option value="Lighting">Custom Lighting</option>
                          <option value="Other">Other Custom Work</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest ml-4">Description</label>
                        <input 
                          type="text"
                          placeholder="e.g., Paint master bedroom in 'Ruby Red'..."
                          value={valueAddRequest.description}
                          onChange={(e) => setValueAddRequest({ ...valueAddRequest, description: e.target.value })}
                          className="w-full px-6 py-4 bg-app-text/5 border border-app-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-app-text"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <p className="text-[10px] text-emerald-600 font-bold leading-relaxed">
                        <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                        Upgrades require owner approval as they add permanent value to the unit. 
                        <strong> Tenant pays upfront</strong> once an agreement is reached. 
                        Work may be performed by internal maintenance or our preferred partner, <strong>JBRUNO</strong>.
                      </p>
                    </div>
                    <button 
                      onClick={handleValueAddSubmit}
                      className="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Submit for Approval
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Painting', 'New Mirror', 'Ceiling Fan'].map(item => (
                      <div key={item} className="p-4 rounded-2xl bg-app-text/5 border border-app-border flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-app-text/60 uppercase tracking-widest">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm">
                <h3 className="text-2xl font-black text-app-text mb-8 uppercase tracking-tighter">Request Maintenance</h3>
                <form onSubmit={handleCreateMaintenance} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-app-text/40 ml-4">Issue Description</label>
                    <textarea 
                      required
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      className="w-full p-6 bg-app-bg border border-app-border rounded-[2rem] focus:ring-1 focus:ring-app-accent/20 focus:outline-none transition-all min-h-[150px] resize-none text-app-text"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !reportText.trim()}
                    className="w-full py-5 bg-app-accent text-white rounded-[2rem] font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest"
                  >
                    {isSubmitting ? 'Submitting...' : (
                      <>
                        <Wrench className="w-5 h-5" /> Submit Request
                      </>
                    )}
                  </button>
                  {showReportSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center text-sm font-bold text-ruby uppercase tracking-widest"
                    >
                      Request Logged Successfully
                    </motion.div>
                  )}
                </form>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm">
                <h3 className="text-2xl font-black text-app-text mb-8 uppercase tracking-tighter">Request History</h3>
                <div className="space-y-6">
                  {maintenanceRequests.length === 0 ? (
                    <div className="text-center py-12 text-app-text/30 italic">
                      No maintenance history found.
                    </div>
                  ) : (
                    maintenanceRequests.map((req) => (
                      <div key={req.id} className="p-6 rounded-3xl bg-app-text/[0.02] border border-app-border flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            req.status === 'Completed' ? 'bg-ruby/10 text-ruby' : 'bg-ruby-light/10 text-ruby-light'
                          }`}>
                            {req.status === 'Completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="font-bold text-app-text uppercase tracking-tight">{req.description}</div>
                            <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest mt-1">
                              {new Date(req.created_at).toLocaleDateString()} • {req.status}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-app-text/10" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-8 rounded-[2.5rem] bg-app-card border border-app-border text-app-text shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <ShieldCheck className="w-20 h-20" />
                </div>
                <h3 className="text-xl font-black mb-6 relative z-10 uppercase tracking-tighter">Repair Standards</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-app-text/5 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-app-accent" />
                    </div>
                    <div>
                      <div className="font-bold text-sm uppercase tracking-tight">Emergency Response</div>
                      <p className="text-[10px] text-app-text/40 leading-relaxed mt-1">
                        Fires, floods, or major leaks are addressed within 4 hours.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-app-text/5 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-ruby" />
                    </div>
                    <div>
                      <div className="font-bold text-sm uppercase tracking-tight">Standard Repairs</div>
                      <p className="text-[10px] text-app-text/40 leading-relaxed mt-1">
                        Non-emergency issues are typically resolved within 48-72 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-app-accent/5 border border-app-accent/10">
                <h4 className="font-bold text-app-accent text-sm mb-2 uppercase tracking-widest">Legal Notice</h4>
                <p className="text-[10px] text-app-text/60 leading-relaxed italic">
                  All maintenance requests are logged with timestamps and IP addresses for legal record-keeping. Unauthorized repairs by tenants are prohibited.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'refer' && (
          <motion.div
            key="refer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-12 rounded-[3rem] bg-app-card border border-app-border shadow-xl text-center">
              <div className="w-20 h-20 bg-app-accent/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <Users className="w-10 h-10 text-app-accent" />
              </div>
              <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">Refer a <span className="italic text-app-accent">Friend</span>.</h3>
              <p className="text-app-text/50 mb-10 leading-relaxed">
                Share the 3875 Ruby experience. When your friend signs a lease, you both get a <span className="font-bold text-app-text">$250 credit</span> towards your next month's rent.
              </p>

              <form onSubmit={handleReferFriend} className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-app-text/40 ml-4">Friend's Name</label>
                  <input 
                    type="text"
                    required
                    value={referralData.name}
                    onChange={(e) => setReferralData({ ...referralData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-app-text/5 border border-transparent rounded-2xl focus:bg-app-card focus:border-app-accent/20 focus:outline-none transition-all"
                    placeholder="Enter their full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-app-text/40 ml-4">Friend's Email</label>
                  <input 
                    type="email"
                    required
                    value={referralData.email}
                    onChange={(e) => setReferralData({ ...referralData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-app-text/5 border border-transparent rounded-2xl focus:bg-app-card focus:border-app-accent/20 focus:outline-none transition-all"
                    placeholder="Enter their email address"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-app-accent text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <Send className="w-5 h-5" /> Send Referral
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-12 pt-8 border-t border-app-text/5">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-serif font-bold text-app-text">12</div>
                    <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Referrals This Month</div>
                  </div>
                  <div className="w-px h-8 bg-app-text/10" />
                  <div className="text-center">
                    <div className="text-2xl font-serif font-bold text-app-text">$3,000</div>
                    <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Tenant Credits Paid</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-12 rounded-[3rem] bg-app-card border border-app-border shadow-xl">
              <h3 className="text-3xl font-serif font-black mb-8">Notification <span className="italic text-app-accent">Settings</span></h3>
              
              <div className="space-y-10">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-app-text/[0.02] border border-app-text/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-ruby/10 text-ruby rounded-2xl">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-app-text">SMS Notifications</div>
                      <p className="text-xs text-app-text/40">Trash, street sweeping & urgent alerts.</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => handleUpdateSettings({ sms_enabled: !settings.sms_enabled })}
                    className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${settings.sms_enabled ? 'bg-app-accent' : 'bg-app-text/10'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${settings.sms_enabled ? 'left-8' : 'left-1'}`} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-app-text/[0.02] border border-app-text/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-app-text">Email Notifications</div>
                      <p className="text-xs text-app-text/40">Rent receipts, lease updates & newsletters.</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => handleUpdateSettings({ email_enabled: !settings.email_enabled })}
                    className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${settings.email_enabled ? 'bg-app-accent' : 'bg-app-text/10'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${settings.email_enabled ? 'left-8' : 'left-1'}`} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 ml-4">
                    <Clock className="w-5 h-5 text-app-accent" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-app-text/40">Preferred Notification Time</h4>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {['07:00', '08:00', '09:00', '10:00'].map((time) => (
                      <button 
                        key={time}
                        onClick={() => handleUpdateSettings({ preferred_notification_time: time })}
                        className={`py-4 rounded-2xl font-bold text-sm transition-all border ${
                          settings.preferred_notification_time === time 
                          ? 'bg-app-accent text-white border-app-accent shadow-md' 
                          : 'bg-app-card text-app-text/40 border-app-border hover:border-app-accent/20'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-app-text/30 italic ml-4">
                    Scheduled alerts for community services will be sent at this time on the morning of the event.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
