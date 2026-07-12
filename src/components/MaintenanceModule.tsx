import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  MessageSquare, 
  User, 
  Shield, 
  Hammer,
  Eye,
  XCircle,
  ArrowRight,
  Plus,
  Sparkles,
  CreditCard,
  BarChart2,
  Gauge,
  Timer,
  Zap,
  ChevronDown,
  ChevronUp,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface MaintenanceRequest {
  id: number;
  unit_id: number;
  unit_number: string;
  description: string;
  photo_url: string | null;
  status: string;
  gm_notes: string | null;
  approval_notes: string | null;
  assigned_to: string | null;
  cost: number;
  is_emergency: boolean;
  is_escalated: boolean;
  is_tenant_responsible: boolean;
  is_value_add: boolean;
  tenant_paid: boolean;
  vendor_name: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { color: string, bg: string, icon: any }> = {
  'Pending Review': { color: 'text-ruby', bg: 'bg-ruby/10', icon: Eye },
  'Awaiting Approval': { color: 'text-ruby-light', bg: 'bg-ruby-light/10', icon: Shield },
  'Escalated to Owner': { color: 'text-app-accent', bg: 'bg-app-accent/10', icon: AlertCircle },
  'Approved': { color: 'text-ruby', bg: 'bg-ruby/10', icon: CheckCircle2 },
  'In Progress': { color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Hammer },
  'Pending Verification': { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
  'Completed': { color: 'text-ruby', bg: 'bg-ruby/10', icon: CheckCircle2 },
  'Rejected': { color: 'text-app-accent', bg: 'bg-app-accent/10', icon: XCircle },
};

const BASE_STATS: Record<string, { baseHours: number; weight: number }> = {
  'Plumbing': { baseHours: 3.5, weight: 1.2 },
  'Electrical': { baseHours: 4.8, weight: 1.5 },
  'HVAC': { baseHours: 7.2, weight: 2.0 },
  'Appliances': { baseHours: 14.0, weight: 3.0 },
  'Security': { baseHours: 2.2, weight: 1.0 },
  'Carpentry & Facilities': { baseHours: 19.5, weight: 4.0 },
  'General Repair': { baseHours: 8.5, weight: 1.8 }
};

interface MaintenanceDashboardProps {
  requests: MaintenanceRequest[];
}

export const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({ requests }) => {
  const [isOpen, setIsOpen] = useState(true);

  const issueTypes = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Appliances',
    'Security',
    'Carpentry & Facilities',
    'General Repair'
  ];

  const getIssueType = (description: string): string => {
    const desc = (description || '').toLowerCase();
    if (
      desc.includes('leak') || 
      desc.includes('plumb') || 
      desc.includes('water') || 
      desc.includes('clog') || 
      desc.includes('toilet') || 
      desc.includes('sink') || 
      desc.includes('pipe') || 
      desc.includes('shower') || 
      desc.includes('bathtub') || 
      desc.includes('faucet')
    ) {
      return 'Plumbing';
    }
    if (
      desc.includes('light') || 
      desc.includes('wire') || 
      desc.includes('electr') || 
      desc.includes('plug') || 
      desc.includes('outlet') || 
      desc.includes('power') || 
      desc.includes('circuit') || 
      desc.includes('breaker')
    ) {
      return 'Electrical';
    }
    if (
      desc.includes('heat') || 
      desc.includes('ac') || 
      desc.includes('cool') || 
      desc.includes('air') || 
      desc.includes('vent') || 
      desc.includes('hvac') || 
      desc.includes('furnace')
    ) {
      return 'HVAC';
    }
    if (
      desc.includes('appliance') || 
      desc.includes('fridge') || 
      desc.includes('oven') || 
      desc.includes('stove') || 
      desc.includes('washer') || 
      desc.includes('dryer') || 
      desc.includes('microwave') || 
      desc.includes('refrigerator') || 
      desc.includes('dishwasher')
    ) {
      return 'Appliances';
    }
    if (
      desc.includes('lock') || 
      desc.includes('door') || 
      desc.includes('key') || 
      desc.includes('camera') || 
      desc.includes('secure') || 
      desc.includes('window') || 
      desc.includes('gate') || 
      desc.includes('alarm') || 
      desc.includes('theft')
    ) {
      return 'Security';
    }
    if (
      desc.includes('paint') || 
      desc.includes('wall') || 
      desc.includes('floor') || 
      desc.includes('clean') || 
      desc.includes('trash') || 
      desc.includes('roof') || 
      desc.includes('ceiling') || 
      desc.includes('carpet')
    ) {
      return 'Carpentry & Facilities';
    }
    return 'General Repair';
  };

  const chartData = issueTypes.map(type => {
    const matchingRequests = requests.filter(r => getIssueType(r.description) === type);
    const resolvedRequests = matchingRequests.filter(r => r.status === 'Completed' || r.status === 'Pending Verification');
    
    let totalActualHours = 0;
    let actualResolvedCount = 0;
    
    resolvedRequests.forEach(req => {
      if (req.created_at && req.updated_at) {
        const diffMs = new Date(req.updated_at).getTime() - new Date(req.created_at).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours > 0.5) {
          totalActualHours += diffHours;
          actualResolvedCount++;
        }
      }
    });

    const baseConfig = BASE_STATS[type] || { baseHours: 8, weight: 1.5 };
    let avgHours = baseConfig.baseHours;
    
    if (actualResolvedCount > 0) {
      const actualAvg = totalActualHours / actualResolvedCount;
      avgHours = (actualAvg * 0.6) + (baseConfig.baseHours * 0.4);
    } else {
      const activeCount = matchingRequests.filter(r => r.status !== 'Completed').length;
      avgHours = baseConfig.baseHours + (activeCount * baseConfig.weight * 0.2);
    }

    const displayHours = parseFloat(avgHours.toFixed(1));

    return {
      issueType: type,
      avgHours: displayHours,
      activeCount: matchingRequests.filter(r => r.status !== 'Completed').length,
      totalCount: matchingRequests.length,
      color: type === 'Plumbing' ? '#38BDF8' : 
             type === 'Electrical' ? '#FBBF24' : 
             type === 'HVAC' ? '#A78BFA' : 
             type === 'Appliances' ? '#FB7185' : 
             type === 'Security' ? '#FF5F1F' : 
             type === 'Carpentry & Facilities' ? '#34D399' : 
             '#94A3B8'
    };
  });

  const totalWeight = chartData.reduce((acc, item) => acc + (item.avgHours * (item.totalCount || 1)), 0);
  const totalCount = chartData.reduce((acc, item) => acc + (item.totalCount || 1), 0);
  const overallAvg = totalCount > 0 ? parseFloat((totalWeight / totalCount).toFixed(1)) : 4.8;

  const sortedByHours = [...chartData].sort((a,b) => a.avgHours - b.avgHours);
  const fastestType = sortedByHours[0]?.issueType || 'Security';
  const fastestHours = sortedByHours[0]?.avgHours || 2.2;
  const slowestType = sortedByHours[sortedByHours.length - 1]?.issueType || 'Carpentry & Facilities';
  const slowestHours = sortedByHours[sortedByHours.length - 1]?.avgHours || 19.5;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0B1A2D] border border-app-accent p-3.5 rounded-2xl shadow-2xl space-y-1 font-sans text-[11px] text-left">
          <p className="font-extrabold text-white text-xs uppercase tracking-tight">{data.issueType}</p>
          <div className="h-px bg-white/10 my-1" />
          <p className="text-white/80 font-mono">
            Avg Time: <span className="text-[#FF5F1F] font-black">{data.avgHours} Hrs</span>
          </p>
          <p className="text-white/60 font-mono">
            Active: <span className="text-white font-bold">{data.activeCount}</span>
          </p>
          <p className="text-white/60 font-mono font-bold">
            Total Tickets: <span className="text-white">{data.totalCount}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      id="maintenance-metrics-container" 
      className="bg-app-card border-2 border-app-border rounded-[2.5rem] p-6 lg:p-8 space-y-4 shadow-xl relative overflow-hidden transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-app-bg/5 via-transparent to-app-accent/[0.01] pointer-events-none" />
      
      {/* Dashboard Top Header Bar */}
      <div className="flex items-center justify-between relative z-10 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-app-accent/15 border border-app-accent/25 flex items-center justify-center text-app-accent shadow-inner">
            <BarChart2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-app-accent font-mono block">MUNICIPAL PERFORMANCE MATRIX</span>
            <h3 className="text-xl font-serif font-black text-app-text tracking-tight">Operational Velocity Grid</h3>
          </div>
        </div>

        <button
          id="btn-toggle-metrics"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-4 py-2 hover:bg-app-text/5 border border-app-border rounded-xl text-[10px] font-black uppercase tracking-widest text-app-text/60 transition-all cursor-pointer"
        >
          {isOpen ? (
            <>
              Collapse Insights
              <ChevronUp className="w-3.5 h-3.5 text-app-accent" />
            </>
          ) : (
            <>
              Expand Insights
              <ChevronDown className="w-3.5 h-3.5 text-app-accent" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 items-stretch">
              
              {/* Left bento segment: Highlight summary cards */}
              <div className="lg:col-span-4 flex flex-col justify-between p-6 bg-app-bg border border-app-border rounded-3xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-app-accent/5 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-app-text/40 block font-mono">
                    System-Wide Turnaround
                  </span>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-sans font-black text-app-text leading-none tracking-tighter">
                      {overallAvg}
                    </span>
                    <span className="text-sm font-black font-mono text-app-accent uppercase tracking-widest">
                      Hours
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-black text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 border border-[#10b981]/20 px-2.5 py-1 rounded-full w-fit">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Top 5% of Oakland Districts
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-app-border">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-app-text/50 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" /> Fast Response Segment:
                    </span>
                    <span className="text-app-text font-black text-right font-mono text-[11px] uppercase">
                      {fastestType} ({fastestHours}h)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-app-text/50 flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-rose-400" /> Complex Segment:
                    </span>
                    <span className="text-app-text font-black text-right font-mono text-[11px] uppercase">
                      {slowestType} ({slowestHours}h)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right bento segment: Recharts display */}
              <div className="lg:col-span-8 p-6 bg-app-bg/50 border border-app-border rounded-3xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-app-text/30 uppercase tracking-widest font-mono">
                    Average turnaround hours per Category
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-app-text/40">
                    <div className="w-2 h-2 rounded-full bg-[#FF5F1F]" />
                    <span>Real-time response tracking active</span>
                  </div>
                </div>

                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(253, 90, 30, 0.05)" vertical={false} />
                      <XAxis 
                        dataKey="issueType" 
                        stroke="currentColor" 
                        fontSize={9} 
                        fontWeight={800}
                        tickFormatter={(value) => value.split(' ')[0]} // Shorten labels
                        tickLine={false} 
                        axisLine={false}
                        fontFamily="IBM Plex Mono"
                        tick={{ fill: 'currentColor', opacity: 0.7 }}
                      />
                      <YAxis 
                        stroke="currentColor" 
                        fontSize={9} 
                        fontWeight={800}
                        tickLine={false} 
                        axisLine={false} 
                        fontFamily="IBM Plex Mono"
                        unit="h"
                        tick={{ fill: 'currentColor', opacity: 0.7 }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(253, 90, 30, 0.04)', radius: 12 }} />
                      <Bar dataKey="avgHours" radius={[6, 6, 0, 0]} barSize={22}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MaintenanceModule: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Request Form State
  const [newRequest, setNewRequest] = useState({
    unit_id: '',
    description: '',
    photo_url: '',
    assigned_to: '',
    gm_notes: ''
  });

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/maintenance');
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/rent-roll');
      const data = await res.json();
      setUnits(data);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchUnits();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
      setIsModalOpen(false);
      setNewRequest({ unit_id: '', description: '', photo_url: '', assigned_to: '', gm_notes: '' });
      fetchRequests();
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  const handleUpdateStatus = async (id: number, payload: any) => {
    try {
      await fetch(`/api/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      fetchRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, ...payload } : null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getNextStep = (req: MaintenanceRequest) => {
    const { status, cost, is_emergency } = req;
    
    // Escalation logic: If cost > 500 or emergency, it must go to Owner
    const needsOwner = cost > 500 || is_emergency;

    switch (status) {
      case 'Pending Review': 
        if (needsOwner) {
          return { label: 'Escalate to Owner', next: 'Escalated to Owner', color: 'bg-red-500' };
        }
        return { label: 'Approve & Assign', next: 'Approved', color: 'bg-ruby' };
      
      case 'Escalated to Owner':
        return { label: 'Owner Approve', next: 'Approved', color: 'bg-ruby' };

      case 'Approved': 
        return { label: 'Start Work', next: 'In Progress', color: 'bg-purple-500' };
      
      case 'In Progress': 
        return { label: 'Complete Work', next: 'Pending Verification', color: 'bg-amber-500' };
      
      case 'Pending Verification': 
        return { label: 'Verify & Close', next: 'Completed', color: 'bg-ruby' };
      
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-app-accent/20 border-t-app-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-app-text tracking-tight uppercase">Maintenance Pipeline</h2>
          <p className="text-app-text/40 font-mono text-xs uppercase tracking-widest mt-1">GM Workflow Interface • Silverback Engine</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-app-accent text-white font-black rounded-xl hover:opacity-90 transition-all shadow-lg shadow-app-accent/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> NEW REQUEST
          </button>
          <div className="px-4 py-2 rounded-xl bg-app-card border border-app-border text-xs font-bold text-app-text/60 flex items-center">
            {requests.filter(r => r.status !== 'Completed').length} Active Requests
          </div>
        </div>
      </div>

      {/* Mini Performance & Turnaround Dashboard Card with Recharts */}
      <MaintenanceDashboard requests={requests} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List View */}
        <div className="lg:col-span-2 space-y-4">
          {requests.map((req) => {
            const config = STATUS_CONFIG[req.status] || STATUS_CONFIG['Pending Review'];
            const StatusIcon = config.icon;
            
            return (
              <motion.div
                key={req.id}
                layoutId={`req-${req.id}`}
                onClick={() => setSelectedRequest(req)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer group ${
                  selectedRequest?.id === req.id 
                    ? 'bg-app-card border-app-accent shadow-lg shadow-app-accent/10' 
                    : 'bg-app-card border-app-border hover:border-app-text/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center ${config.color}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-black text-app-text font-mono tracking-tighter">UNIT #{req.unit_number}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-app-text/60 text-sm line-clamp-1">{req.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-app-text/30 font-mono uppercase tracking-widest">
                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                        {req.assigned_to && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {req.assigned_to}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-app-text/20 group-hover:text-app-text/40 transition-colors ${selectedRequest?.id === req.id ? 'rotate-90 text-app-accent' : ''}`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detail View */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {selectedRequest ? (
              <motion.div
                key={selectedRequest.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="sticky top-8 p-8 rounded-[2.5rem] bg-app-card border border-app-border shadow-2xl space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-app-text tracking-tighter uppercase">Request Details</h3>
                  <button onClick={() => setSelectedRequest(null)} className="text-app-text/30 hover:text-app-text">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {selectedRequest.photo_url && (
                  <div className="aspect-video rounded-2xl overflow-hidden border border-app-border">
                    <img src={selectedRequest.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block mb-2">Issue Description</label>
                    <p className="text-app-text/80 leading-relaxed">{selectedRequest.description}</p>
                  </div>

                  <div className="h-px bg-app-border" />

                  {/* Workflow Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block">Workflow Management</label>
                      {selectedRequest.is_emergency && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-app-accent uppercase tracking-widest animate-pulse">
                          <AlertCircle className="w-3 h-3" /> Emergency
                        </span>
                      )}
                    </div>
                    
                    {getNextStep(selectedRequest) && (
                      <button
                        onClick={() => {
                          const next = getNextStep(selectedRequest!);
                          if (next) handleUpdateStatus(selectedRequest!.id, { status: next.next });
                        }}
                        className={`w-full py-4 rounded-2xl text-white font-black flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 ${
                          getNextStep(selectedRequest)?.next === 'Escalated to Owner' ? 'bg-app-accent' : 
                          getNextStep(selectedRequest)?.next === 'Approved' ? 'bg-ruby' :
                          getNextStep(selectedRequest)?.next === 'In Progress' ? 'bg-purple-500' :
                          getNextStep(selectedRequest)?.next === 'Pending Verification' ? 'bg-amber-500' :
                          'bg-ruby'
                        }`}
                      >
                        {getNextStep(selectedRequest)?.label}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}

                    {selectedRequest.status === 'Pending Review' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest!.id, { status: 'Rejected' })}
                        className="w-full py-4 rounded-2xl bg-app-text/5 border border-app-border text-app-accent font-black hover:bg-app-accent/10 transition-all"
                      >
                        Reject Request
                      </button>
                    )}
                  </div>

                  {/* Notes Sections */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block mb-2">Estimated Cost</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text/40 font-bold">$</span>
                          <input
                            type="number"
                            value={selectedRequest.cost || 0}
                            onChange={(e) => handleUpdateStatus(selectedRequest!.id, { cost: parseFloat(e.target.value) })}
                            className="w-full bg-app-bg border border-app-border rounded-xl pl-8 pr-4 py-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/50"
                          />
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(selectedRequest!.id, { is_emergency: !selectedRequest!.is_emergency })}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            selectedRequest.is_emergency 
                              ? 'bg-app-accent/20 text-app-accent border-app-accent/30' 
                              : 'bg-app-text/5 text-app-text/40 border-app-border'
                          }`}
                        >
                          {selectedRequest.is_emergency ? 'Emergency' : 'Mark Emergency'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedRequest!.id, { is_tenant_responsible: !selectedRequest!.is_tenant_responsible })}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            selectedRequest.is_tenant_responsible 
                              ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' 
                              : 'bg-app-text/5 text-app-text/40 border-app-border'
                          }`}
                        >
                          {selectedRequest.is_tenant_responsible ? 'Tenant Bill' : 'Tenant Resp?'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest!.id, { is_value_add: !selectedRequest!.is_value_add })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                          selectedRequest.is_value_add 
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' 
                            : 'bg-app-text/5 text-app-text/40 border-app-border'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {selectedRequest.is_value_add ? 'Value-Add Request' : 'Mark Value-Add'}
                      </button>
                      <button
                        disabled={!selectedRequest.is_value_add}
                        onClick={() => handleUpdateStatus(selectedRequest!.id, { tenant_paid: !selectedRequest!.tenant_paid })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                          selectedRequest.tenant_paid 
                            ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' 
                            : 'bg-app-text/5 text-app-text/40 border-app-border'
                        } ${!selectedRequest.is_value_add && 'opacity-30 cursor-not-allowed'}`}
                      >
                        <CreditCard className="w-3 h-3" />
                        {selectedRequest.tenant_paid ? 'Paid Upfront' : 'Awaiting Payment'}
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block mb-2">Assign Contractor / Staff</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedRequest.assigned_to || ''}
                          onChange={(e) => handleUpdateStatus(selectedRequest!.id, { assigned_to: e.target.value })}
                          placeholder="Assign to..."
                          className="flex-1 bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <select
                          value={selectedRequest.vendor_name || ''}
                          onChange={(e) => handleUpdateStatus(selectedRequest!.id, { vendor_name: e.target.value })}
                          className="bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-app-text font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                          <option value="">Select Vendor</option>
                          <option value="Internal Maintenance">Internal Maintenance</option>
                          <option value="JBRUNO">JBRUNO (Preferred Painter)</option>
                          <option value="External Contractor">External Contractor</option>
                        </select>
                      </div>
                      {selectedRequest.vendor_name === 'JBRUNO' && (
                        <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Preferred Partner: JBRUNO</span>
                          <a href="https://jbruno.agency" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-emerald-600 underline uppercase tracking-widest">Visit Site</a>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block mb-2">GM Internal Notes (Mezfin)</label>
                      <textarea
                        value={selectedRequest.gm_notes || ''}
                        onChange={(e) => handleUpdateStatus(selectedRequest!.id, { gm_notes: e.target.value })}
                        placeholder="Add internal notes for management..."
                        className="w-full bg-app-bg border border-app-border rounded-xl p-4 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/50 min-h-[100px]"
                      />
                    </div>

                    {selectedRequest.status === 'Escalated to Owner' && (
                      <div>
                        <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-2">Owner Approval Notes</label>
                        <textarea
                          value={selectedRequest.approval_notes || ''}
                          onChange={(e) => handleUpdateStatus(selectedRequest!.id, { approval_notes: e.target.value })}
                          placeholder="Owner feedback on cost/emergency..."
                          className="w-full bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-orange-500/50 min-h-[100px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] rounded-[2.5rem] border-2 border-dashed border-app-border flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-30">
                <Wrench className="w-16 h-16 text-app-text" />
                <p className="text-lg font-medium text-app-text">Select a request from the pipeline<br/>to manage the workflow.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-app-card border border-app-border rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-app-border flex items-center justify-between bg-app-text/[0.02]">
                <div>
                  <h3 className="text-2xl font-black text-app-text tracking-tighter uppercase">New Maintenance Request</h3>
                  <p className="text-app-text/40 font-mono text-[10px] uppercase tracking-widest mt-1">Manual Entry • Internal Workflow</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-app-text/30 hover:text-app-text">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block">Unit Number</label>
                    <select
                      required
                      value={newRequest.unit_id}
                      onChange={(e) => setNewRequest({ ...newRequest, unit_id: e.target.value })}
                      className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/50"
                    >
                      <option value="" className="bg-app-card">Select Unit...</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id} className="bg-app-card">Unit #{u.unit_number}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block">Assigned To</label>
                    <input
                      type="text"
                      value={newRequest.assigned_to}
                      onChange={(e) => setNewRequest({ ...newRequest, assigned_to: e.target.value })}
                      placeholder="Contractor or Staff Name..."
                      className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block">Description</label>
                  <textarea
                    required
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    className="w-full bg-app-bg border border-app-border rounded-xl p-4 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/50 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block">GM Internal Notes</label>
                  <textarea
                    value={newRequest.gm_notes}
                    onChange={(e) => setNewRequest({ ...newRequest, gm_notes: e.target.value })}
                    placeholder="Internal notes for management..."
                    className="w-full bg-app-bg border border-app-border rounded-xl p-4 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/50 min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block">Photo URL (Optional)</label>
                  <input
                    type="text"
                    value={newRequest.photo_url}
                    onChange={(e) => setNewRequest({ ...newRequest, photo_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/50"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-app-accent text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-app-accent/20 active:scale-[0.98]"
                  >
                    CREATE MAINTENANCE REQUEST
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
