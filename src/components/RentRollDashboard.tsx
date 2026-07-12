import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Building2, 
  Users, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  MessageSquare,
  FileText,
  ShieldAlert,
  Gavel,
  RefreshCw,
  Mail,
  Wrench,
  History,
  Calendar,
  Send,
  Shield,
  Check,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface RentRollItem {
  id: number;
  unit_number: string;
  rent_amount: number;
  status: string;
  tenant_name: string | null;
  tenant_id: number | null;
  lease_end: string | null;
  balance_due: number;
  last_login_at: string | null;
  last_login_ip: string | null;
  last_payment_date: string | null;
  last_payment_status: string | null;
  neighborhood: string | null;
  photos: string | null;
  needs_reply: number;
  last_tenant_activity_at: string | null;
}

interface User {
  id: number;
  email: string;
  role: 'OWNER' | 'GM' | 'ACCOUNTING';
  name: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
  neighborhood: string;
  trash_day: string;
  street_sweeping_day: string;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  created_at: string;
}

interface MaintenanceRequest {
  id: number;
  description: string;
  photo_url: string | null;
  status: string;
  created_at: string;
}

interface Stats {
  total_units: number;
  occupied_units: number;
  total_potential_revenue: number;
}

interface TenantNotice {
  id: number;
  title: string;
  content: string;
  status: string;
  sent_at: string;
  viewed_at?: string;
  acknowledged_at?: string;
  acknowledged_ip?: string;
  viewed_ip?: string;
}

interface LeaseViolation {
  id: number;
  description: string;
  violation_date: string;
  status: string;
}

export const RentRollDashboard: React.FC = () => {
  const [data, setData] = useState<RentRollItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<RentRollItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof RentRollItem | 'unit_number' | 'tenant_name' | 'lease_end' | 'balance_due'; direction: 'asc' | 'desc' } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('All');
  
  // Detail views state
  const [messages, setMessages] = useState<Message[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [notices, setNotices] = useState<TenantNotice[]>([]);
  const [violations, setViolations] = useState<LeaseViolation[]>([]);
  const [isLoggingViolation, setIsLoggingViolation] = useState(false);
  const [violationData, setViolationData] = useState({ description: '', violation_date: new Date().toISOString().split('T')[0] });
  const [newMessage, setNewMessage] = useState('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cookieStatus, setCookieStatus] = useState<'checking' | 'active' | 'blocked'>('checking');
  const [lastBankUpload, setLastBankUpload] = useState<string | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankMatches, setBankMatches] = useState<any[]>([]);
  const bankInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [editUnitData, setEditUnitData] = useState({ status: '', photos: '' });

  // Interactive modal sub-tab state
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'history' | 'actions'>('overview');

  // Quick action custom forms state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [emailTemplate, setEmailTemplate] = useState('general');
  const [quickMaintDesc, setQuickMaintDesc] = useState('');
  const [quickMaintSeverity, setQuickMaintSeverity] = useState('Normal');
  const [maintSubmittingState, setMaintSubmittingState] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  // Prepopulate email based on selected template and unit details
  useEffect(() => {
    if (!selectedUnit) return;
    const days = selectedUnit.lease_end ? getDaysRemaining(selectedUnit.lease_end) : 'N/A';
    const newRent = Math.round(selectedUnit.rent_amount * 1.05);
    
    if (emailTemplate === 'general') {
      setEmailSubject(`Update regarding Unit #${selectedUnit.unit_number}`);
      setEmailBody(`Dear ${selectedUnit.tenant_name || 'Resident'},\n\nWe hope you are having an excellent week at Rent-Ruby. Please let us know if you have any administrative questions or feedback.\n\nBest regards,\nLauren (AI Assistant)\nRent-Ruby Hub`);
    } else if (emailTemplate === 'late') {
      setEmailSubject(`⚠️ Outstanding Balance Reminder - Unit #${selectedUnit.unit_number}`);
      setEmailBody(`Dear ${selectedUnit.tenant_name || 'Resident'},\n\nThis is a friendly reminder that an outstanding balance of $${selectedUnit.balance_due} is currently recorded for Unit #${selectedUnit.unit_number}.\n\nPlease clear this balance or check secure direct deposit routing with Chase at your earliest convenience to preserve good standing.\n\nBest regards,\nLauren (AI Assistant)\nRent-Ruby Management`);
    } else if (emailTemplate === 'renewal') {
      setEmailSubject(`🏡 Lease Renewal Proposal - Unit #${selectedUnit.unit_number}`);
      setEmailBody(`Dear ${selectedUnit.tenant_name || 'Resident'},\n\nYour current lease is scheduled to expire on ${selectedUnit.lease_end || 'N/A'} (approx. ${days} days remaining).\n\nWe would love to extend your residency at 3875 Ruby Street. We are pleased to propose a standard 12-month renewal at a locked-in rate of $${newRent}/month (a standard 5% adjustment aligned with Oakland medical corridor averages).\n\nPlease reply or confirm in the communication bubble if you wish to lock in this offer!\n\nBest regards,\nLauren (AI Assistant)\nRent-Ruby Hub`);
    } else if (emailTemplate === 'audit') {
      setEmailSubject(`📋 Dynamic Security & Maintenance Review - Unit #${selectedUnit.unit_number}`);
      setEmailBody(`Dear ${selectedUnit.tenant_name || 'Resident'},\n\nWe will be running a routine, non-intrusive safety review of fire sensors and access entry tags for all suites in the Mosswood district next week.\n\nThere is no preparation or entry required on your end unless we contact you individually. Thank you for helping us maintain peak Giants-standard secure housing.\n\nBest regards,\nLauren (AI Assistant)\nRent-Ruby Operations`);
    }
  }, [emailTemplate, selectedUnit]);

  const handleQuickEmailDispatch = async () => {
    if (!selectedUnit) return;
    setEmailStatus('sending');
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedUnit.id,
          sender: 'Manager',
          content: `[EMAIL DISPATCH] Subject: ${emailSubject}\n\n${emailBody}`
        })
      });
      fetchUnitDetails(selectedUnit.id, selectedUnit.tenant_id);
      setEmailStatus('sent');
      setTimeout(() => {
        setEmailStatus('idle');
      }, 3000);
    } catch (e) {
      console.error(e);
      setEmailStatus('idle');
    }
  };

  const handleQuickMaintSubmit = async () => {
    if (!selectedUnit || !quickMaintDesc.trim()) return;
    setMaintSubmittingState('submitting');
    try {
      await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedUnit.id,
          description: `[${quickMaintSeverity.toUpperCase()}] ${quickMaintDesc}`,
          photo_url: null
        })
      });
      fetchUnitDetails(selectedUnit.id, selectedUnit.tenant_id);
      setQuickMaintDesc('');
      setMaintSubmittingState('submitted');
      setTimeout(() => {
        setMaintSubmittingState('idle');
      }, 3000);
    } catch (e) {
      console.error(e);
      setMaintSubmittingState('idle');
    }
  };

  // Confirmation state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const fetchData = async () => {
    try {
      const [rentRollRes, statsRes, meRes, propRes] = await Promise.all([
        fetch('/api/rent-roll'),
        fetch('/api/stats'),
        fetch('/api/me'),
        fetch('/api/property/1')
      ]);
      const rentRollData = await rentRollRes.json();
      const statsData = await statsRes.json();
      const meData = await meRes.json();
      const propData = await propRes.json();
      setData(rentRollData);
      setStats(statsData);
      setUser(meData);
      setProperty(propData);
    } catch (error) {
      console.error("Error fetching rent roll:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitDetails = async (unitId: number, tenantId: number | null) => {
    try {
      const [msgRes, maintRes] = await Promise.all([
        fetch(`/api/messages/${unitId}`),
        fetch(`/api/maintenance/${unitId}`)
      ]);
      setMessages(await msgRes.json());
      setMaintenance(await maintRes.json());
      
      if (tenantId) {
        const [noticesRes, violationsRes] = await Promise.all([
          fetch(`/api/tenant-notices/${tenantId}`),
          fetch(`/api/lease-violations/${tenantId}`)
        ]);
        setNotices(await noticesRes.json());
        setViolations(await violationsRes.json());
      } else {
        setNotices([]);
        setViolations([]);
      }
    } catch (error) {
      console.error("Error fetching unit details:", error);
    }
  };

  const checkCookies = async () => {
    try {
      await fetch('/api/cookie-set');
      // Small delay to ensure cookie is processed
      setTimeout(async () => {
        const res = await fetch('/api/cookie-verify');
        const data = await res.json();
        setCookieStatus(data.active ? 'active' : 'blocked');
      }, 500);
    } catch (error) {
      console.error("Cookie check failed:", error);
      setCookieStatus('blocked');
    }
  };

  useEffect(() => {
    fetchData();
    checkCookies();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      fetchUnitDetails(selectedUnit.id, selectedUnit.tenant_id);
    }
  }, [selectedUnit]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUnit) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedUnit.id,
          sender: 'Manager',
          content: newMessage
        })
      });
      setNewMessage('');
      fetchUnitDetails(selectedUnit.id, selectedUnit.tenant_id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAddUnit = () => {
    setConfirmState({
      isOpen: true,
      title: 'Add New Unit',
      message: 'Are you sure you want to initialize a new unit entry? This will create a vacant record in the system.',
      type: 'info',
      onConfirm: () => {
        console.log('Adding unit...');
        // In a real app, this would be a POST request
      }
    });
  };

  const handleMarkOverdue = (unitId: number) => {
    const unit = data.find(u => u.id === unitId);
    if (!unit) return;

    setConfirmState({
      isOpen: true,
      title: 'CONFIRM DELINQUENCY',
      message: `You are about to mark Unit #${unit.unit_number} as OVERDUE. 

This action will:
1. Flag the tenant (${unit.tenant_name}) as delinquent.
2. Trigger an automated late notice email.
3. Apply a $50 administrative late fee to the balance.
4. Enable the 'Chase Direct Deposit' recovery link.

Are you absolutely sure you want to proceed?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await fetch(`/api/rent-roll/${unitId}/overdue`, { method: 'PATCH' });
          fetchData(); // Refresh the table
        } catch (error) {
          console.error("Error marking overdue:", error);
        }
      }
    });
  };

  const handleGenerateReport = async (unitId: number) => {
    try {
      const res = await fetch(`/api/reports/unit/${unitId}`);
      const data = await res.json();
      
      // Fetch additional legal data
      if (data.unit.tenant_id) {
        const [noticesRes, violationsRes] = await Promise.all([
          fetch(`/api/tenant-notices/${data.unit.tenant_id}`),
          fetch(`/api/lease-violations/${data.unit.tenant_id}`)
        ]);
        data.notices = await noticesRes.json();
        data.violations = await violationsRes.json();
      } else {
        data.notices = [];
        data.violations = [];
      }

      setReportData(data);
      setIsReportOpen(true);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const handleLogViolation = async () => {
    if (!selectedUnit?.tenant_id) return;
    try {
      await fetch('/api/lease-violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: selectedUnit.tenant_id,
          ...violationData
        })
      });
      setIsLoggingViolation(false);
      setViolationData({ description: '', violation_date: new Date().toISOString().split('T')[0] });
      fetchUnitDetails(selectedUnit.id, selectedUnit.tenant_id);
    } catch (error) {
      console.error("Failed to log violation:", error);
    }
  };

  const handleBankCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      
      // Simple fuzzy matching logic for demo purposes
      // In a real app, this would be more robust
      const matches = data.map(unit => {
        const found = rows.find(row => 
          row.some(cell => cell.toLowerCase().includes(unit.tenant_name?.toLowerCase() || ''))
        );
        return {
          unit,
          matched: !!found,
          amount: found ? found.find(cell => !isNaN(parseFloat(cell))) : null,
          date: found ? found[0] : null
        };
      }).filter(m => m.matched);

      setBankMatches(matches);
      setIsBankModalOpen(true);
      setLastBankUpload(new Date().toLocaleString());
    };
    reader.readAsText(file);
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const applyBankMatches = async () => {
    // In a real app, this would send updates to the server
    setIsBankModalOpen(false);
    fetchData();
    alert(`Successfully processed ${bankMatches.length} payments from CHASE bank.`);
  };

  const handleChaseSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Create mock bank matches based on the rent roll
      const matches = data.filter(u => u.last_payment_status !== 'Paid').slice(0, 3).map(u => ({
        matched: true,
        unit: u,
        amount: String(u.rent_amount),
        date: new Date().toISOString().split('T')[0]
      }));

      // if everyone is paid, just pick first few
      const finalMatches = matches.length > 0 ? matches : data.slice(0, 2).map(u => ({
        matched: true,
        unit: u,
        amount: String(u.rent_amount),
        date: new Date().toISOString().split('T')[0]
      }));

      setBankMatches(finalMatches);
      setLastBankUpload(new Date().toLocaleString());
      setIsBankModalOpen(true);
      setIsSyncing(false);
    }, 1500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUnit) return;

    const description = prompt("Enter a description for this maintenance request:", "Photo Uploaded");
    if (description === null) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await fetch('/api/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unit_id: selectedUnit.id,
            description: description || "Photo Uploaded",
            photo_url: base64String
          })
        });
        fetchUnitDetails(selectedUnit.id, selectedUnit.tenant_id);
      } catch (error) {
        console.error("Error uploading photo:", error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatCurrency = (val: number | null | undefined) => {
    return (val ?? 0).toLocaleString();
  };

  const getDaysRemaining = (dateStr: string | null) => {
    if (!dateStr) return null;
    const end = new Date(dateStr);
    const now = new Date();
    // Set both to start of day for accurate day calculation
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleUpdateUnit = async () => {
    if (!selectedUnit) return;
    try {
      await fetch(`/api/units/${selectedUnit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUnitData)
      });
      setIsEditingUnit(false);
      fetchData();
      setSelectedUnit(prev => prev ? { ...prev, ...editUnitData } : null);
    } catch (error) {
      console.error("Error updating unit:", error);
    }
  };

  const isOwnerOrAccounting = user?.role === 'OWNER' || user?.role === 'ACCOUNTING';
  const isGM = user?.role === 'GM';
  const isGMOrOwner = user?.role === 'GM' || user?.role === 'OWNER';

  const isUnansweredAlert = (unit: RentRollItem) => {
    if (!unit.needs_reply || !unit.last_tenant_activity_at) return false;
    const activityDate = new Date(unit.last_tenant_activity_at);
    const now = new Date();
    const diffHours = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
    return diffHours >= 48;
  };

  const filteredAndSortedData = React.useMemo(() => {
    let result = [...data];

    // Filter by search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.unit_number.toLowerCase().includes(lowerSearch) || 
        (u.tenant_name && u.tenant_name.toLowerCase().includes(lowerSearch))
      );
    }

    // Filter by status
    if (statusFilter !== 'All') {
      result = result.filter(u => u.status === statusFilter);
    }

    // Filter by neighborhood
    if (neighborhoodFilter !== 'All') {
      result = result.filter(u => u.neighborhood === neighborhoodFilter);
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === bVal) return 0;
        if (aVal === null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bVal === null) return sortConfig.direction === 'asc' ? -1 : 1;

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, statusFilter, neighborhoodFilter]);

  const requestSort = (key: keyof RentRollItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-app-accent/20 border-t-app-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
      />
      
      {/* Global Alerts */}
      {data.some(isUnansweredAlert) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[2rem] bg-app-accent/10 border border-app-accent/20 flex items-center justify-between gap-6 shadow-2xl shadow-app-accent/5"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-app-accent flex items-center justify-center text-white shadow-lg shadow-app-accent/40 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-app-text tracking-tighter uppercase">Legal Compliance Alert</h3>
              <p className="text-app-accent font-mono text-xs font-bold uppercase tracking-widest mt-1">
                {data.filter(isUnansweredAlert).length} Tenant messages unanswered for 48+ hours. Immediate response required for legal defense.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                const firstAlert = data.find(isUnansweredAlert);
                if (firstAlert) {
                  setSelectedUnit(firstAlert);
                  setIsDetailOpen(true);
                }
              }}
              className="px-8 py-4 rounded-2xl bg-app-accent text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-app-accent/20"
            >
              Review Alerts
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-[2.5rem] bg-app-card border border-app-border shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-app-accent/10 text-app-accent">
              <Building2 className="w-8 h-8" />
            </div>
            <span className="text-sm font-black text-app-text/40 uppercase tracking-widest">Occupancy Rate</span>
          </div>
          <div className="text-6xl font-black text-app-text tracking-tighter">
            {stats ? Math.round((stats.occupied_units / stats.total_units) * 100) : 0}%
          </div>
          <div className="mt-4 text-sm font-mono text-app-text/30 uppercase tracking-widest">
            {stats?.occupied_units} / {stats?.total_units} Units Active
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-app-card border border-app-border shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-app-accent/10 text-app-accent">
              <CreditCard className="w-8 h-8" />
            </div>
            <span className="text-sm font-black text-app-text/40 uppercase tracking-widest">Potential Revenue</span>
          </div>
          <div className="text-6xl font-black text-app-text tracking-tighter">
            ${stats ? formatCurrency(stats.total_potential_revenue) : 0}
          </div>
          <div className="mt-4 text-sm font-mono text-app-text/30 uppercase tracking-widest">
            Monthly Target • Silverback Projection
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-app-accent/10 border border-app-accent/20 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-app-accent/20 text-app-accent">
                <AlertCircle className="w-8 h-8" />
              </div>
              <span className="text-sm font-black text-app-accent uppercase tracking-widest">Community Alerts</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Trash Day</span>
                <span className="text-sm font-black text-app-text uppercase">{property?.trash_day || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Street Sweeping</span>
                <span className="text-sm font-black text-app-text uppercase">{property?.street_sweeping_day || 'N/A'}</span>
              </div>
              <button className="w-full mt-4 py-3 rounded-xl bg-app-accent text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
                Send SMS Notice to All
              </button>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-app-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        </div>
      </div>

      {/* Security & Financial Trend (Owner Only) */}
      {isOwnerOrAccounting && (
        <div className="bg-app-card rounded-[3rem] border border-app-border shadow-2xl p-10 mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 w-1/3 opacity-5 pointer-events-none">
                <Building2 className="w-full h-full text-app-text" />
            </div>
            <div className="mb-8 z-10 relative">
                <h3 className="text-3xl font-black tracking-tighter uppercase text-app-text">Financial & Security Insight</h3>
                <p className="text-sm font-mono text-app-text/40 tracking-widest mt-2 uppercase">Lateness trends and real-time payment aggregation across 24 units</p>
                <p className="text-sm text-app-accent font-bold mt-2 pr-20 max-w-2xl">
                    "High-end rent roll tracking dynamically aligns Chase and Stripe data to capture patterns instantly, securing your margin in unpredictable markets."
                </p>
            </div>
            
            <div className="h-[300px] w-full z-10 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={[
                            { month: 'Nov', late_units: 3, amount_at_risk: 4200 },
                            { month: 'Dec', late_units: 4, amount_at_risk: 5400 },
                            { month: 'Jan', late_units: 2, amount_at_risk: 3100 },
                            { month: 'Feb', late_units: 1, amount_at_risk: 1800 },
                            { month: 'Mar', late_units: 5, amount_at_risk: 6800 },
                            { month: 'Apr', late_units: 2, amount_at_risk: 3200 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="month" stroke="currentColor" className="text-[10px] font-mono tracking-widest opacity-40 uppercase" />
                        <YAxis stroke="currentColor" className="text-[10px] font-mono tracking-widest opacity-40" />
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0B1A2D', borderRadius: '1rem', border: 'none', color: '#fff' }}
                            itemStyle={{ color: '#FF5F1F' }}
                        />
                        <Bar yAxisId={0} dataKey="late_units" fill="#FF5F1F" radius={[4, 4, 0, 0]} name="Late Units" maxBarSize={40} />
                        <Bar yAxisId={0} dataKey="amount_at_risk" fill="rgba(255, 95, 31, 0.2)" radius={[4, 4, 0, 0]} name="Value At Risk" maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}

      {/* Rent Roll Table */}
      <div className="bg-app-card rounded-[3rem] border border-app-border shadow-2xl overflow-hidden transition-colors duration-500">
        <div className="p-10 border-b border-app-border flex items-center justify-between bg-app-text/[0.01]">
          <div>
            <h2 className="text-4xl font-black text-app-text tracking-tighter uppercase">Active Rent Roll</h2>
            <p className="text-app-text/40 font-mono text-xs uppercase tracking-widest mt-1">
              {isOwnerOrAccounting ? 'Owner/Accounting Control Level' : 'GM View Level'} • {data.length} Units Total
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {isOwnerOrAccounting && (
              <button 
                onClick={handleChaseSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Chase'}
              </button>
            )}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-4 bg-app-text/5 border border-app-border rounded-2xl text-app-text font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-app-accent/50"
            >
              <option value="All">All Statuses</option>
              <option value="Occupied">Occupied</option>
              <option value="Vacant">Vacant</option>
            </select>
            <select
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
              className="px-6 py-4 bg-app-text/5 border border-app-border rounded-2xl text-app-text font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-app-accent/50"
            >
              <option value="All">All Neighborhoods</option>
              <option value="Mosswood">Mosswood</option>
              <option value="Piedmont Ave">Piedmont Ave</option>
            </select>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text/30" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search units, tenants..."
                className="pl-12 pr-6 py-4 bg-app-text/5 border border-app-border rounded-2xl text-app-text font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-app-accent/50 w-80"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app-border">
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em] cursor-pointer hover:text-app-text transition-colors" onClick={() => requestSort('unit_number')}>
                  Unit {sortConfig?.key === 'unit_number' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em] cursor-pointer hover:text-app-text transition-colors" onClick={() => requestSort('status')}>
                  Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em] cursor-pointer hover:text-app-text transition-colors" onClick={() => requestSort('tenant_name')}>
                  Tenant {sortConfig?.key === 'tenant_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em] cursor-pointer hover:text-app-text transition-colors" onClick={() => requestSort('rent_amount')}>
                  Rent {sortConfig?.key === 'rent_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em] cursor-pointer hover:text-app-text transition-colors" onClick={() => requestSort('balance_due')}>
                  Balance {sortConfig?.key === 'balance_due' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em]">Last Payment</th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em] cursor-pointer hover:text-app-text transition-colors" onClick={() => requestSort('lease_end')}>
                  Lease End {sortConfig?.key === 'lease_end' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {filteredAndSortedData.map((unit) => (
                <tr 
                  key={unit.id}
                  onClick={() => {
                    setSelectedUnit(unit);
                    setIsDetailOpen(true);
                  }}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-app-text/5 flex items-center justify-center text-2xl font-black text-app-text border border-app-border group-hover:border-app-accent/30 transition-all">
                          {unit.unit_number}
                        </div>
                        {isUnansweredAlert(unit) && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-app-accent rounded-full flex items-center justify-center border-2 border-app-card animate-bounce shadow-lg shadow-app-accent/40">
                            <AlertCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${
                      unit.status === 'Occupied' 
                        ? 'bg-app-accent/20 text-app-accent border-app-accent/30' 
                        : 'bg-app-text/20 text-app-text/40 border-app-text/30'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${unit.status === 'Occupied' ? 'bg-app-accent' : 'bg-app-text/40'}`} />
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-6">
                      {unit.tenant_name ? (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-app-accent/20 flex items-center justify-center text-xl font-black text-app-accent border border-app-accent/20 shadow-inner">
                            {unit.tenant_name.charAt(0)}
                          </div>
                          <span className="text-xl font-black text-app-text tracking-tighter">{unit.tenant_name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-app-text/30 italic font-mono font-bold tracking-widest">VACANT</span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <span className="text-2xl font-black text-app-text font-mono tracking-tighter">${formatCurrency(unit.rent_amount)}</span>
                  </td>
                  <td className="px-10 py-10">
                    <span className={`text-2xl font-black font-mono tracking-tighter ${(unit.balance_due ?? 0) > 0 ? 'text-app-accent' : 'text-app-text/30'}`}>
                      ${formatCurrency(unit.balance_due)}
                    </span>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-app-text/40 font-mono font-bold">
                        <Clock className="w-4 h-4" />
                        <span className="text-base">{unit.last_payment_date || 'N/A'}</span>
                      </div>
                      {unit.status === 'Occupied' && (
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${unit.last_payment_status === 'Paid' ? 'text-app-accent' : 'text-app-accent'}`}>
                          {unit.last_payment_status || 'Pending'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    {unit.lease_end ? (
                      <div className="flex flex-col gap-1">
                        <div className="text-xl font-black text-app-text font-mono tracking-tighter">
                          {unit.lease_end}
                        </div>
                        {(() => {
                          const days = getDaysRemaining(unit.lease_end);
                          if (days === null) return null;
                          const isExpiringSoon = days >= 0 && days <= 30;
                          const isExpired = days < 0;
                          return (
                            <div className={`text-[10px] font-black uppercase tracking-widest ${isExpiringSoon || isExpired ? 'text-app-accent' : 'text-app-text/40'}`}>
                              {isExpired ? 'Expired' : `${days} Days Remaining`}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <span className="text-sm text-app-text/30 italic font-mono font-bold tracking-widest">N/A</span>
                    )}
                  </td>
                  <td className="px-10 py-10 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {isOwnerOrAccounting && unit.status === 'Occupied' && unit.last_payment_status !== 'Late' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkOverdue(unit.id);
                          }}
                          className="px-4 py-2 shrink-0 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-colors bg-red-500/10 hover:bg-red-500 rounded-xl"
                        >
                          Mark Overdue
                        </button>
                      )}
                      <button className="p-3 text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5">
                        <MoreHorizontal className="w-6 h-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedUnit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-6xl bg-app-card border border-app-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-app-border flex items-center justify-between bg-app-text/[0.02]">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-app-accent/20 flex items-center justify-center text-2xl font-black text-app-accent border border-app-accent/20">
                  #{selectedUnit.unit_number}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-app-text tracking-tighter">Management Module</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-app-text/40 font-mono text-sm uppercase tracking-widest">
                      {selectedUnit.tenant_name || 'VACANT'} • Silverback Intelligence Active
                    </p>
                    <span className="w-1 h-1 rounded-full bg-app-border" />
                    <span className="text-xs font-black text-app-accent uppercase tracking-widest">{selectedUnit.neighborhood || 'Mosswood'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleGenerateReport(selectedUnit.id)}
                  className="flex items-center gap-2 px-6 py-3 bg-app-text/5 border border-app-border rounded-xl font-bold text-sm text-app-text/60 hover:bg-app-text/10 transition-all"
                >
                  <FileText className="w-4 h-4" /> Generate Report
                </button>
                <button 
                  onClick={() => setIsDetailOpen(false)}
                  className="p-3 bg-app-text/5 rounded-xl text-app-text/40 hover:text-app-text transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
            </div>

            {/* Main Content Split View */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel: Unit & Tenant Details */}
              <div 
                style={{ width: `${leftPanelWidth}%` }}
                className="border-r border-app-border p-8 overflow-y-auto space-y-8 bg-app-bg/30"
              >
                {/* Interactive sub-tab selector */}
                <div className="flex bg-app-text/5 border border-app-border p-1.5 rounded-2xl gap-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: Building2 },
                    { id: 'history', label: 'Tenant History & Lease', icon: History },
                    { id: 'actions', label: 'Action Hub', icon: Shield }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeModalTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveModalTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isActive 
                            ? 'bg-app-accent text-white shadow-lg shadow-app-accent/20' 
                            : 'text-app-text/40 hover:text-app-text hover:bg-app-text/5'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-tab 1: Overview */}
                {activeModalTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-app-text/5 border border-app-border space-y-1">
                        <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest font-mono">Monthly Rent</div>
                        <div className="text-xl font-bold text-app-text">${formatCurrency(selectedUnit.rent_amount)}</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-app-text/5 border border-app-border space-y-1">
                        <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest font-mono">Balance Due</div>
                        <div className="text-xl font-bold text-app-accent">${formatCurrency(selectedUnit.balance_due)}</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-app-text/5 border border-app-border space-y-1">
                        <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest font-mono">Lease End</div>
                        <div className="text-xl font-bold text-app-text">{selectedUnit.lease_end || 'N/A'}</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-app-text/5 border border-app-border space-y-1">
                        <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest font-mono">Last Payment</div>
                        <div className="text-xl font-bold text-app-accent">{selectedUnit.last_payment_date || 'None'}</div>
                      </div>
                    </div>

                    {/* GM/Owner Controls: Vacancy & Photos */}
                    {(isOwnerOrAccounting || isGM) && (
                      <div className="p-6 rounded-3xl bg-app-text/5 border border-app-border space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-app-text uppercase tracking-widest">Unit Management</h4>
                          <button 
                            onClick={() => {
                              if (isEditingUnit) {
                                handleUpdateUnit();
                              } else {
                                setEditUnitData({ status: selectedUnit.status, photos: selectedUnit.photos || '' });
                                setIsEditingUnit(true);
                              }
                            }}
                            className="px-4 py-2 bg-app-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                          >
                            {isEditingUnit ? 'Save Changes' : 'Edit Unit'}
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest block mb-1.5">Occupancy Status</label>
                            <select
                              disabled={!isEditingUnit}
                              value={isEditingUnit ? editUnitData.status : selectedUnit.status}
                              onChange={(e) => setEditUnitData({ ...editUnitData, status: e.target.value })}
                              className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-app-text disabled:opacity-50"
                            >
                              <option value="Occupied">Occupied</option>
                              <option value="Vacant">Vacant</option>
                              <option value="Maintenance">Maintenance</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest block mb-1.5">Unit Photos (URLs)</label>
                            <textarea
                              disabled={!isEditingUnit}
                              value={isEditingUnit ? editUnitData.photos : selectedUnit.photos || ''}
                              onChange={(e) => setEditUnitData({ ...editUnitData, photos: e.target.value })}
                              placeholder="Enter comma-separated image URLs..."
                              className="w-full bg-app-bg border border-app-border rounded-xl p-4 text-sm text-app-text disabled:opacity-50 min-h-[80px]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Login History */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-app-text/40 uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Tenant Activity Log
                      </h4>
                      <div className="p-6 rounded-2xl bg-app-text/5 border border-app-border space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-app-text/60">Last Login</div>
                          <div className="text-sm font-bold text-app-text">{selectedUnit.last_login_at ? new Date(selectedUnit.last_login_at).toLocaleString() : 'Never'}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-app-text/60">Login Location</div>
                          <div className="text-sm font-mono text-app-text/40">{selectedUnit.last_login_ip || 'N/A'}</div>
                        </div>
                        <div className="pt-2 text-[10px] text-app-text/30 uppercase tracking-widest italic">
                          * Activity logging compliant with local privacy regulations
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 2: Tenant History & Lease */}
                {activeModalTab === 'history' && (
                  <div className="space-y-8 animate-fadeIn">
                    {/* Lease Expiration indicator widget */}
                    <div className="p-6 rounded-2xl border border-app-border bg-app-text/[0.02] space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-app-text/40 uppercase tracking-widest flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-app-accent" /> Lease Lifespan & Expiration
                        </h4>
                        {selectedUnit.lease_end ? (
                          <span className={`text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded ${
                            getDaysRemaining(selectedUnit.lease_end) <= 90 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                          }`}>
                            {getDaysRemaining(selectedUnit.lease_end) <= 90 ? 'Expiring Soon' : 'Active Term'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded bg-app-text/10 text-app-text/50">Month-to-month</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-app-text/60">Upcoming Lease Expiration Date</span>
                          <span className="text-base font-black text-app-text tracking-tighter">{selectedUnit.lease_end || 'N/A'}</span>
                        </div>

                        {selectedUnit.lease_end && (
                          <>
                            <div className="relative w-full h-3 bg-app-text/5 border border-app-border rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  getDaysRemaining(selectedUnit.lease_end) <= 90 ? 'bg-app-accent' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(10, ((365 - getDaysRemaining(selectedUnit.lease_end)) / 365) * 100))}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider">
                              <span className="text-app-text/30">Contract Origin (Estimated)</span>
                              <span className="font-extrabold text-app-text/80">{getDaysRemaining(selectedUnit.lease_end)} Days Remaining</span>
                            </div>
                          </>
                        )}
                      </div>

                      {selectedUnit.lease_end && getDaysRemaining(selectedUnit.lease_end) <= 90 && (
                        <div className="p-4 rounded-xl bg-app-accent/10 border border-app-accent/20 flex items-start gap-3 mt-4">
                          <AlertTriangle className="w-5 h-5 text-app-accent shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-app-text">Urgent Lease Action Advised</p>
                            <p className="text-[11px] text-app-text/60 leading-relaxed">
                              This lease terminates in under 90 days. It is advised to dispatch a renewal notice proposal to lock high premium Giants yields.
                            </p>
                            <button 
                              onClick={() => {
                                setActiveModalTab('actions');
                                setEmailTemplate('renewal');
                              }}
                              className="text-[10px] font-black text-app-accent uppercase tracking-widest flex items-center gap-1 hover:underline pt-1"
                            >
                              Draft Renewal Notice <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline of Tenant History */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-app-text/40 uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                        <History className="w-4 h-4" /> Comprehensive Tenant History
                      </h4>

                      <div className="relative border-l border-app-border pl-6 space-y-6 ml-3">
                        {/* Milestone: Access tags issued */}
                        <div className="relative">
                          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-app-card border-2 border-emerald-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest font-mono">System Automated</span>
                            <h5 className="text-sm font-bold text-app-text mt-0.5">Gated Access Authorization</h5>
                            <p className="text-xs text-app-text/40 mt-1">Dual-encrypted access tags configured and synchronized with system cameras.</p>
                          </div>
                        </div>

                        {/* Milestone: Check deposits */}
                        <div className="relative">
                          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-app-card border-2 border-emerald-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest font-mono">Financial Clearance</span>
                            <h5 className="text-sm font-bold text-app-text mt-0.5">Security Deposit Vaulted</h5>
                            <p className="text-xs text-app-text/40 mt-1">Primary secure security deposit cleared successfully in escrow holding.</p>
                          </div>
                        </div>

                        {/* Last payment entry */}
                        {selectedUnit.last_payment_date && (
                          <div className="relative">
                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-app-card border-2 border-emerald-500 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest font-mono">Rent Clearing Log</span>
                              <h5 className="text-sm font-bold text-app-text mt-0.5">Payment Completed (${formatCurrency(selectedUnit.rent_amount)})</h5>
                              <p className="text-xs text-app-text/40 mt-1">
                                Monthly contract quota cleared successfully on {selectedUnit.last_payment_date} ({selectedUnit.last_payment_status || 'Auto-Debit'}).
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Historic Maintenance Work Orders */}
                        {maintenance.length > 0 && (
                          <div className="relative">
                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-app-card border-2 border-app-accent flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-app-accent" />
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-app-accent uppercase tracking-widest font-mono">Service History</span>
                              <h5 className="text-sm font-bold text-app-text mt-0.5">Reported Maintenance Ticket</h5>
                              <div className="space-y-2 mt-2">
                                {maintenance.map(req => (
                                  <div key={req.id} className="p-3 rounded-lg bg-app-text/5 border border-app-border flex items-center justify-between text-xs">
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-app-text">{req.description}</p>
                                      <p className="text-[9px] uppercase tracking-wider text-app-text/40">Status: {req.status}</p>
                                    </div>
                                    <span className="text-[9px] font-mono opacity-30">{new Date(req.created_at).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Historic Compliance Notices */}
                        {notices.length > 0 && (
                          <div className="relative">
                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-app-card border-2 border-ruby flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-ruby" />
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-ruby uppercase tracking-widest font-mono">Legal Compliance</span>
                              <h5 className="text-sm font-bold text-app-text mt-0.5">Official Notices Logged</h5>
                              <div className="space-y-2 mt-2">
                                {notices.map(notice => (
                                  <div key={notice.id} className="p-3 rounded-lg bg-ruby/5 border border-ruby/10 flex items-center justify-between text-xs">
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-app-text">{notice.title}</p>
                                      <p className="text-[9px] uppercase tracking-wider text-ruby">Acknowledged: {notice.status}</p>
                                    </div>
                                    <span className="text-[9px] font-mono opacity-30">{new Date(notice.sent_at).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 3: Action Hub */}
                {activeModalTab === 'actions' && (
                  <div className="space-y-8 animate-fadeIn">
                    {/* Send Digital Email Composer */}
                    <div className="p-6 rounded-2xl border border-app-border bg-app-text/[0.02] space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-app-text/40 uppercase tracking-widest flex items-center gap-2">
                          <Mail className="w-4 h-4 text-app-accent" /> Dispatch Secure Resident Email
                        </h4>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-40">Lauren (AI Agent) proxy</span>
                      </div>

                      {emailStatus === 'sent' ? (
                        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                          <p className="text-sm font-bold text-app-text">Notice Dispatched Successfully!</p>
                          <p className="text-xs text-app-text/50">
                            Sent to Tenant Email and copied/forwarded to <span className="text-app-text/80 font-bold">bryan@norcalcarbmobile.com</span>.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-widest text-app-text/40 mb-1">Select Template</label>
                              <select 
                                value={emailTemplate}
                                onChange={(e) => setEmailTemplate(e.target.value)}
                                className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold"
                              >
                                <option value="general">General Administration Update</option>
                                <option value="late">Outstanding Balance Reminder</option>
                                <option value="renewal">Standard 12-Month Lease Renewal Offer</option>
                                <option value="audit">Dynamic Property Safety Review</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-widest text-app-text/40 mb-1">Recipient Account</label>
                              <input 
                                type="text" 
                                readOnly
                                value={`${selectedUnit.tenant_name || 'Resident'} (${selectedUnit.tenant_name?.split(' ')[0].toLowerCase() || 'resident'}@rent-ruby.com)`}
                                className="w-full bg-app-bg/50 border border-app-border/40 text-app-text/40 rounded-lg px-3 py-2 text-xs font-mono font-bold cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-app-text/40 mb-1">Email Subject Line</label>
                            <input 
                              type="text" 
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold focus:outline-none focus:ring-1 focus:ring-app-accent/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-app-text/40 mb-1">Dispatch Message Content</label>
                            <textarea 
                              value={emailBody}
                              onChange={(e) => setEmailBody(e.target.value)}
                              rows={5}
                              className="w-full bg-app-bg border border-app-border rounded-lg p-3 text-xs text-app-text focus:outline-none focus:ring-1 focus:ring-app-accent/50 leading-relaxed font-sans"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-1">
                            <span className="text-[9px] text-app-text/30 font-mono">* Copies dynamically CC'ed to bryan@norcalcarbmobile.com</span>
                            <button 
                              onClick={handleQuickEmailDispatch}
                              disabled={emailStatus === 'sending'}
                              className="flex items-center gap-1.5 px-5 py-2.5 bg-app-accent text-white font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all disabled:opacity-40"
                            >
                              {emailStatus === 'sending' ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Sending...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Dispatch Email Notice</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Maintenance Dispatcher (Work Orders) */}
                    <div className="p-6 rounded-2xl border border-app-border bg-app-text/[0.02] space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-app-text/40 uppercase tracking-widest flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-app-accent" /> Log Urgent Maintenance Work Order
                        </h4>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-40">Direct-to-Technician queue</span>
                      </div>

                      {maintSubmittingState === 'submitted' ? (
                        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                          <Check className="w-10 h-10 text-emerald-500 mx-auto" />
                          <p className="text-sm font-bold text-app-text">Work Order Dispatched!</p>
                          <p className="text-xs text-app-text/50">Ticket registered under Suite #{selectedUnit.unit_number} and appended to historical logs.</p>
                        </div>
                      ) : (
                        <div className="space-y-4 text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-widest text-app-text/40 mb-1">Severity / Urgency</label>
                              <select 
                                value={quickMaintSeverity}
                                onChange={(e) => setQuickMaintSeverity(e.target.value)}
                                className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold"
                              >
                                <option value="Low Priority">Low Priority (Non-emergency amenity fixing)</option>
                                <option value="Normal">Normal Priority (Plumbing, entry locks, metrics)</option>
                                <option value="Emergency">CRITICAL (Plumbing overflowing, HVAC outage)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-widest text-app-text/40 mb-1">Target Residence</label>
                              <input 
                                type="text" 
                                readOnly
                                value={`Suite #${selectedUnit.unit_number} (${selectedUnit.neighborhood || 'Mosswood'})`}
                                className="w-full bg-app-bg/50 border border-app-border/40 text-app-text/40 rounded-lg px-3 py-2 text-xs font-bold cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-app-text/40 mb-1">Issue Concern Description</label>
                            <input 
                              type="text" 
                              value={quickMaintDesc}
                              onChange={(e) => setQuickMaintDesc(e.target.value)}
                              placeholder="e.g., Clogged kitchen sink, elevator keypad unresponsive, HVAC leak..."
                              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold focus:outline-none focus:ring-1 focus:ring-app-accent/50"
                            />
                          </div>

                          <div className="flex justify-end pt-1">
                            <button 
                              onClick={handleQuickMaintSubmit}
                              disabled={maintSubmittingState === 'submitting' || !quickMaintDesc.trim()}
                              className="flex items-center gap-1.5 px-5 py-2.5 bg-app-accent text-white font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all disabled:opacity-40"
                            >
                              {maintSubmittingState === 'submitting' ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Logging...</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Dispatch Technician & Log Ticket</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Resize Handle */}
              <div 
                className="w-1 bg-app-border hover:bg-app-accent/50 cursor-col-resize transition-colors"
                onMouseDown={(e) => {
                  const startX = e.pageX;
                  const startWidth = leftPanelWidth;
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    const delta = ((moveEvent.pageX - startX) / window.innerWidth) * 100;
                    setLeftPanelWidth(Math.min(Math.max(startWidth + delta, 30), 70));
                  };
                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              />

              {/* Right Panel: Chat / Communication */}
              <div className="flex-1 flex flex-col bg-app-card">
                <div className="p-6 border-b border-app-border flex items-center justify-between bg-app-text/[0.01]">
                  <h4 className="text-xs font-black text-app-text/40 uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Communication Hub
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-app-accent animate-pulse" />
                    <span className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">Tenant Online</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'Manager' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                        msg.sender === 'Manager' 
                          ? 'bg-app-accent text-white rounded-tr-none' 
                          : 'bg-app-text/5 text-app-text/60 border border-app-border rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <div className="text-[10px] text-app-text/30 mt-1 uppercase tracking-widest font-mono">
                        {msg.sender} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                      <MessageSquare className="w-12 h-12 text-app-text/30" />
                      <p className="text-sm text-app-text/40">No message history yet.<br/>Start the conversation below.</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-app-border bg-app-text/[0.02]">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message to the tenant..."
                      className="flex-1 bg-app-text/5 border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/50"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="px-6 py-3 bg-app-accent text-white font-black rounded-xl hover:opacity-90 transition-colors shadow-lg shadow-app-accent/20"
                    >
                      SEND
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[10px] text-app-text/30 font-mono uppercase tracking-widest">
                      Press Enter to send
                    </div>
                    <button className="text-[10px] font-black text-app-text/40 uppercase tracking-widest hover:text-app-text transition-colors">
                      Email Copy to Manager
                    </button>
                  </div>
                </div>

                {/* Unit Management (GM/Owner Only) */}
                {isGMOrOwner && (
                  <div className="p-6 border-t border-white/5 bg-white/[0.01] space-y-6">
                    {/* Unit Status/Photos */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-app-text/40 uppercase tracking-widest">Unit Management</h4>
                        <button 
                          onClick={() => {
                            setIsEditingUnit(!isEditingUnit);
                            setEditUnitData({ 
                              status: selectedUnit.status, 
                              photos: selectedUnit.photos || '' 
                            });
                          }}
                          className="text-[10px] font-black text-app-accent uppercase tracking-widest hover:opacity-80 transition-colors"
                        >
                          {isEditingUnit ? 'Cancel' : 'Edit Unit'}
                        </button>
                      </div>

                      {isEditingUnit ? (
                        <div className="space-y-4 bg-app-text/5 p-4 rounded-xl border border-app-border">
                          <div>
                            <label className="block text-[8px] font-black text-app-text/40 uppercase tracking-widest mb-1">Status</label>
                            <select 
                              value={editUnitData.status}
                              onChange={(e) => setEditUnitData({ ...editUnitData, status: e.target.value })}
                              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold focus:outline-none focus:ring-1 focus:ring-app-accent/50"
                            >
                              <option value="Occupied">Occupied</option>
                              <option value="Vacant">Vacant</option>
                              <option value="Maintenance">Maintenance</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8px] font-black text-app-text/40 uppercase tracking-widest mb-1">Photo URL</label>
                            <input 
                              type="text"
                              value={editUnitData.photos}
                              onChange={(e) => setEditUnitData({ ...editUnitData, photos: e.target.value })}
                              placeholder="https://..."
                              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold focus:outline-none focus:ring-1 focus:ring-app-accent/50"
                            />
                          </div>
                          <button 
                            onClick={handleUpdateUnit}
                            className="w-full py-2 bg-app-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-app-text/5 border border-app-border">
                            <span className="block text-[8px] font-black text-app-text/40 uppercase tracking-widest mb-1">Status</span>
                            <span className="text-xs font-bold text-app-text uppercase">{selectedUnit.status}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-app-text/5 border border-app-border">
                            <span className="block text-[8px] font-black text-app-text/40 uppercase tracking-widest mb-1">Photos</span>
                            <span className="text-xs font-bold text-app-text uppercase">{selectedUnit.photos ? 'Available' : 'None'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lease Violations */}
                    {selectedUnit.tenant_id && (
                      <div className="pt-6 border-t border-app-border">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-black text-app-text/40 uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert className="w-3 h-3 text-app-accent" /> Lease Violations
                          </h4>
                          <button 
                            onClick={() => setIsLoggingViolation(!isLoggingViolation)}
                            className="text-[10px] font-black text-app-accent uppercase tracking-widest hover:opacity-80 transition-colors"
                          >
                            {isLoggingViolation ? 'Cancel' : 'Log Violation'}
                          </button>
                        </div>

                        {isLoggingViolation ? (
                          <div className="space-y-4 bg-app-accent/5 p-4 rounded-xl border border-app-accent/10">
                            <input 
                              type="date"
                              value={violationData.violation_date}
                              onChange={(e) => setViolationData({ ...violationData, violation_date: e.target.value })}
                              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold"
                            />
                            <textarea 
                              value={violationData.description}
                              onChange={(e) => setViolationData({ ...violationData, description: e.target.value })}
                              placeholder="Describe the violation (e.g., unauthorized guest, noise)..."
                              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold min-h-[80px]"
                            />
                            <button 
                              onClick={handleLogViolation}
                              className="w-full py-2 bg-app-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
                            >
                              Log Violation
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {violations.map(v => (
                              <div key={v.id} className="p-3 rounded-lg bg-app-text/5 border border-app-border flex justify-between items-start">
                                <div>
                                  <div className="text-[8px] font-black text-app-accent uppercase tracking-widest mb-1">{v.violation_date}</div>
                                  <div className="text-xs text-app-text/60 leading-relaxed">{v.description}</div>
                                </div>
                                <span className="text-[8px] font-black text-app-text/30 uppercase tracking-widest">{v.status}</span>
                              </div>
                            ))}
                            {violations.length === 0 && (
                              <div className="text-[10px] text-app-text/30 italic">No violations logged.</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Legal Notices Tracking */}
                    {selectedUnit.tenant_id && (
                      <div className="pt-6 border-t border-app-border">
                        <h4 className="text-[10px] font-black text-app-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Gavel className="w-3 h-3 text-app-accent" /> Notice Tracking
                        </h4>
                        <div className="space-y-3">
                          {notices.map(n => (
                            <div key={n.id} className="p-3 rounded-lg bg-app-text/5 border border-app-border">
                              <div className="flex justify-between items-start mb-2">
                                <div className="text-xs font-bold text-app-text">{n.title}</div>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                                  n.status === 'Acknowledged' ? 'bg-ruby/20 text-ruby' : 'bg-app-accent/20 text-app-accent'
                                }`}>
                                  {n.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[8px] font-black text-app-text/30 uppercase tracking-widest">
                                <div>Sent: {new Date(n.sent_at).toLocaleDateString()}</div>
                                {n.viewed_at && <div>Viewed: {new Date(n.viewed_at).toLocaleDateString()}</div>}
                                {n.acknowledged_at && <div className="col-span-2 text-emerald-500">Ack: {new Date(n.acknowledged_at).toLocaleString()}</div>}
                                {n.acknowledged_ip && <div className="col-span-2 opacity-50">IP: {n.acknowledged_ip}</div>}
                              </div>
                            </div>
                          ))}
                          {notices.length === 0 && (
                            <div className="text-[10px] text-app-text/30 italic">No notices issued.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* Report Modal */}
      {isReportOpen && reportData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-4xl bg-white text-black overflow-y-auto max-h-full p-12 shadow-2xl relative">
            <button 
              onClick={() => setIsReportOpen(false)}
              className="absolute top-8 right-8 p-2 text-zinc-400 hover:text-black print:hidden"
            >
              <Plus className="w-8 h-8 rotate-45" />
            </button>
            
            <div className="print:block">
              <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-12">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase">Unit Performance Report</h1>
                  <p className="text-zinc-500 font-mono text-sm mt-2">Generated on {new Date().toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black">UNIT #{reportData.unit.unit_number}</div>
                  <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">3875 Ruby Street</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-12">
                <section className="space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-black/10 pb-2">Tenant Information</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Name:</span>
                      <span className="font-bold">{reportData.unit.tenant_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Email:</span>
                      <span className="font-bold">{reportData.unit.tenant_email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Lease Start:</span>
                      <span className="font-bold">{reportData.unit.lease_start || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Lease End:</span>
                      <span className="font-bold">{reportData.unit.lease_end || 'N/A'}</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-black/10 pb-2">Financial Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Monthly Rent:</span>
                      <span className="font-bold">${formatCurrency(reportData.unit.rent_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Current Balance:</span>
                      <span className={`font-bold ${reportData.unit.balance_due > 0 ? 'text-red-600' : ''}`}>
                        ${formatCurrency(reportData.unit.balance_due)}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
              
              {/* Legal Defense Package */}
              <section className="mb-12 space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-black pb-2">Legal Defense Package (Evidence Log)</h2>
                
                <div className="space-y-8">
                  {/* Notice Acknowledgments */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest">1. Notice Acknowledgments</h3>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-black/10">
                          <th className="text-left py-2">Notice Title</th>
                          <th className="text-left py-2">Sent</th>
                          <th className="text-left py-2">Viewed</th>
                          <th className="text-left py-2">Acknowledged</th>
                          <th className="text-right py-2">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {reportData.notices.map((n: any) => (
                          <tr key={n.id}>
                            <td className="py-2 font-bold">{n.title}</td>
                            <td className="py-2">{new Date(n.sent_at).toLocaleDateString()}</td>
                            <td className="py-2">{n.viewed_at ? new Date(n.viewed_at).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-2 font-bold text-ruby">{n.acknowledged_at ? new Date(n.acknowledged_at).toLocaleString() : 'PENDING'}</td>
                            <td className="py-2 text-right font-mono text-[10px]">{n.acknowledged_ip || n.viewed_ip || 'N/A'}</td>
                          </tr>
                        ))}
                        {reportData.notices.length === 0 && <tr><td colSpan={5} className="py-4 text-center italic text-zinc-400">No notices issued.</td></tr>}
                      </tbody>
                    </table>
                  </div>

                  {/* Lease Violations */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest">2. Documented Lease Violations</h3>
                    <div className="space-y-3">
                      {reportData.violations.map((v: any) => (
                        <div key={v.id} className="p-4 bg-zinc-50 border border-black/5 rounded-lg">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold">{v.violation_date}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{v.status}</span>
                          </div>
                          <p className="text-sm">{v.description}</p>
                        </div>
                      ))}
                      {reportData.violations.length === 0 && <p className="text-sm italic text-zinc-400">No violations documented.</p>}
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-black/10 pb-2 mb-6">Payment History</h2>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5">
                      <th className="py-3 font-bold">Date</th>
                      <th className="py-3 font-bold">Amount</th>
                      <th className="py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {reportData.payments.map((p: any) => (
                      <tr key={p.id}>
                        <td className="py-3">{p.payment_date}</td>
                        <td className="py-3">${formatCurrency(p.amount)}</td>
                        <td className="py-3 font-bold">{p.status}</td>
                      </tr>
                    ))}
                    {reportData.payments.length === 0 && (
                      <tr><td colSpan={3} className="py-8 text-center text-zinc-400 italic">No payment records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </section>

              <section className="mb-12">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-black/10 pb-2 mb-6">Maintenance Logs</h2>
                <div className="space-y-4">
                  {reportData.maintenance.map((m: any) => (
                    <div key={m.id} className="border-b border-black/5 pb-4">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">{m.description}</span>
                        <span className="text-xs font-mono text-zinc-500">{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs uppercase font-black text-zinc-400">{m.status}</div>
                    </div>
                  ))}
                  {reportData.maintenance.length === 0 && (
                    <div className="py-8 text-center text-zinc-400 italic">No maintenance history found.</div>
                  )}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-black/10 pb-2 mb-6">Communication Transcript</h2>
                <div className="space-y-4">
                  {reportData.messages.map((msg: any) => (
                    <div key={msg.id} className="text-sm">
                      <span className="font-bold uppercase text-[10px] mr-2">{msg.sender}:</span>
                      <span className="text-zinc-600">{msg.content}</span>
                      <span className="text-[10px] text-zinc-400 ml-2 font-mono">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                  {reportData.messages.length === 0 && (
                    <div className="py-8 text-center text-zinc-400 italic">No communication history found.</div>
                  )}
                </div>
              </section>

              <div className="mt-24 pt-8 border-t border-black/10 text-[10px] font-bold uppercase tracking-[0.5em] text-center text-zinc-400">
                Official Document • Silverback Intelligence System • 3875 Ruby St
              </div>
            </div>

            <div className="mt-12 flex justify-center print:hidden">
              <button 
                onClick={() => window.print()}
                className="px-12 py-4 bg-black text-white font-black rounded-2xl hover:bg-zinc-800 transition-all flex items-center gap-3"
              >
                <CreditCard className="w-5 h-5" /> Print Official Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Upload Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-app-card border border-app-border rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-app-border flex items-center justify-between bg-app-text/[0.02]">
              <div>
                <h3 className="text-2xl font-black text-app-text tracking-tighter uppercase">CHASE Bank Import Results</h3>
                <p className="text-app-text/40 font-mono text-[10px] uppercase tracking-widest mt-1">Fuzzy Match Engine Active</p>
              </div>
              <button onClick={() => setIsBankModalOpen(false)} className="text-app-text/30 hover:text-app-text">
                <Plus className="w-8 h-8 rotate-45" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {bankMatches.length > 0 ? (
                <div className="space-y-4">
                  {bankMatches.map((match, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-app-text/5 border border-app-border flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-app-text">Unit #{match.unit.unit_number} — {match.unit.tenant_name}</div>
                        <div className="text-[10px] text-app-text/40 uppercase tracking-widest">Matched via Description: {match.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-app-accent">${match.amount}</div>
                        <div className="text-[10px] text-app-text/30 uppercase tracking-widest">Confidence: HIGH</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <AlertCircle className="w-12 h-12 text-app-text/20 mx-auto" />
                  <p className="text-app-text/40">No matches found in the uploaded CSV.</p>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-app-border bg-app-text/[0.02] flex justify-end gap-4">
              <button 
                onClick={() => setIsBankModalOpen(false)}
                className="px-6 py-3 text-app-text/40 font-bold hover:text-app-text transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={applyBankMatches}
                className="px-8 py-3 bg-app-accent text-white font-black rounded-xl hover:opacity-90 transition-all shadow-lg shadow-app-accent/20"
              >
                Apply to Rent Roll
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
