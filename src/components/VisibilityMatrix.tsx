import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, Building, Check, Search, Lock, ShieldCheck, RefreshCw, Eye, Sparkles } from 'lucide-react';

interface PermissionItem {
  id: string;
  name: string;
  description: string;
  module: string;
}

const DEFAULT_TENANT_PERMISSIONS: PermissionItem[] = [
  { id: 't1', name: 'Info Nook Access', description: 'View checklists, rules, parking maps, & smart bin schedules.', module: 'TenantPortal' },
  { id: 't2', name: 'Submit Maintenance Requests', description: 'Log requests offline or online with photo uploads.', module: 'Maintenance' },
  { id: 't3', name: 'Custom Intake Forms', description: 'Fill out Pet, Sublet, and Key registrations.', module: 'TenantPortal' },
  { id: 't4', name: 'Mailbox Customization', description: 'Change individual unit mailbox door colors.', module: 'Mailboxes' },
  { id: 't5', name: 'Offline Sync Outbox', description: 'Keep pending requests queued locally during disconnects.', module: 'SyncEngine' },
  { id: 't6', name: 'Chat with Lauren AI', description: 'Query rules, local restaurants, and neighborhood details.', module: 'AILauren' }
];

const DEFAULT_GM_PERMISSIONS: PermissionItem[] = [
  { id: 'g1', name: 'Unit Occupancy Controls', description: 'Manually toggle occupied/vacant states for 24 units.', module: 'AdminOccupancy' },
  { id: 'g2', name: 'Respond to Tenant Concerns', description: 'Audit. reply to, and flag complaints or noise alerts.', module: 'Concerns' },
  { id: 'g3', name: 'Assign Maintenance Orders', description: 'Monitor incoming problems and schedule vendor work.', module: 'Maintenance' },
  { id: 'g4', name: 'Live Security Camera Feeds', description: 'View dynamic simulated camera angles in the courtyard.', module: 'Security' },
  { id: 'g5', name: 'HTML Email Templates', description: 'Edit and test outreach newsletters inside browser.', module: 'Outreach' },
  { id: 'g6', name: 'Vendor Directories', description: 'Add, search, and dial approved contract services.', module: 'Vendors' }
];

const DEFAULT_OWNER_PERMISSIONS: PermissionItem[] = [
  { id: 'o1', name: 'Executive Rent Roll Sheets', description: 'Read full lease terms, deposit sizes, and late fee warnings.', module: 'RentRoll' },
  { id: 'o2', name: 'CEO Briefings Index', description: 'Read aggregated financials and investor updates.', module: 'CEO' },
  { id: 'o3', name: 'Revenue Intelligence Area Charts', description: 'View interactive graphs of monthly profits and projections.', module: 'Revenue' },
  { id: 'o4', name: 'Legal Notice Acknowledgements', description: 'File official notices, legal fines, and lock-out paperwork.', module: 'Legal' },
  { id: 'o5', name: 'MarketMax Strategic Pricing', description: 'Evaluate pricing limits based on local Oakland RAP guidelines.', module: 'MarketMax' },
  { id: 'o6', name: 'SF Plus Building Expansion', description: 'View zoning details, tax incentives, and building diagrams.', module: 'SFPlus' }
];

export const VisibilityMatrix: React.FC = () => {
  const [tenantActive, setTenantActive] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('ruby_perm_tenant');
      return cached ? JSON.parse(cached) : DEFAULT_TENANT_PERMISSIONS.map(p => p.id);
    } catch {
      return DEFAULT_TENANT_PERMISSIONS.map(p => p.id);
    }
  });

  const [gmActive, setGmActive] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('ruby_perm_gm');
      return cached ? JSON.parse(cached) : DEFAULT_GM_PERMISSIONS.map(p => p.id);
    } catch {
      return DEFAULT_GM_PERMISSIONS.map(p => p.id);
    }
  });

  const [ownerActive, setOwnerActive] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('ruby_perm_owner');
      return cached ? JSON.parse(cached) : DEFAULT_OWNER_PERMISSIONS.map(p => p.id);
    } catch {
      return DEFAULT_OWNER_PERMISSIONS.map(p => p.id);
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'tenant' | 'gm' | 'owner'>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('ruby_perm_tenant', JSON.stringify(tenantActive));
  }, [tenantActive]);

  useEffect(() => {
    localStorage.setItem('ruby_perm_gm', JSON.stringify(gmActive));
  }, [gmActive]);

  useEffect(() => {
    localStorage.setItem('ruby_perm_owner', JSON.stringify(ownerActive));
  }, [ownerActive]);

  const handleToggle = (tier: 'tenant' | 'gm' | 'owner', id: string) => {
    if (tier === 'tenant') {
      setTenantActive(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else if (tier === 'gm') {
      setGmActive(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else if (tier === 'owner') {
      setOwnerActive(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
    
    setSuccessMessage('Governance standards updated!');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleReset = () => {
    setTenantActive(DEFAULT_TENANT_PERMISSIONS.map(p => p.id));
    setGmActive(DEFAULT_GM_PERMISSIONS.map(p => p.id));
    setOwnerActive(DEFAULT_OWNER_PERMISSIONS.map(p => p.id));
    setSuccessMessage('System permissions reset to original matrix!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const matchesSearch = (item: PermissionItem) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.module.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const renderChecklist = (
    tier: 'tenant' | 'gm' | 'owner', 
    items: PermissionItem[], 
    activeIds: string[], 
    title: string, 
    badgeColor: string, 
    icon: React.ReactNode
  ) => {
    const filteredItems = items.filter(matchesSearch);

    return (
      <div className="flex flex-col bg-zinc-900/60 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
        {/* Dynamic decorative visual indicators */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/[0.01]" />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-white/5`}>
              {icon}
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white leading-none">{title}</h4>
              <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold mt-1 block">Active configuration</span>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full border ${badgeColor}`}>
            Tier: {activeIds.length} / {items.length}
          </span>
        </div>

        <div className="space-y-3 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/30 uppercase tracking-widest font-black">
              No matching modules
            </div>
          ) : (
            filteredItems.map(item => {
              const isActive = activeIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleToggle(tier, item.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer hover:bg-white/[0.03] ${
                    isActive 
                      ? 'bg-zinc-950 border-white/10' 
                      : 'bg-zinc-950/40 border-white/5 opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    isActive 
                      ? 'bg-[#FF5F1F] border-[#FF5F1F] text-white' 
                      : 'border-white/20'
                  }`}>
                    {isActive && <Check className="w-3 h-3" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wide text-white block truncate">
                        {item.name}
                      </span>
                      <span className="text-[7px] font-mono tracking-widest text-[#FF5F1F] uppercase bg-[#FF5F1F]/5 px-1 py-0.5 rounded">
                        {item.module}
                      </span>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed mt-1 font-semibold">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 md:p-10 bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
      {/* Decorative colored glow mimicking premium SF skyline architecture style */}
      <div className="absolute top-0 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-app-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
              Administrative Governance
            </span>
            <span className="text-white/30 text-[9px] uppercase tracking-widest font-bold">● Admin Panel Only</span>
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            Three-Tier Visibility Matrix
          </h3>
          <p className="text-xs text-white/50 uppercase tracking-widest font-bold mt-1">
            Standard permissions checklist for Tenants, General Managers, and Owners.
          </p>
        </div>

        {/* Buttons & Indicators */}
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {successMessage && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-3 py-1.5 rounded-full"
              >
                {successMessage}
              </motion.span>
            )}
          </AnimatePresence>

          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-black text-[9px] uppercase tracking-widest cursor-pointer text-white flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" /> Reset default
          </button>
        </div>
      </div>

      {/* Quick Search and Level Toggles */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
        {/* Level filtering tabs */}
        <div className="flex p-0.5 bg-zinc-900 border border-white/10 rounded-xl w-full md:w-auto">
          {[
            { id: 'all', label: 'All Tiers' },
            { id: 'tenant', label: 'Tenant Tier 1' },
            { id: 'gm', label: 'GM Tier 2' },
            { id: 'owner', label: 'Owner Tier 3' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-[#FF5F1F] text-white shadow-md' 
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search permission targets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 transition-all font-bold tracking-wide"
          />
        </div>
      </div>

      {/* Checklist Matrices display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {(activeTab === 'all' || activeTab === 'tenant') && 
          renderChecklist(
            'tenant', 
            DEFAULT_TENANT_PERMISSIONS, 
            tenantActive, 
            '1. Tenant Visibility', 
            'text-amber-500 border-amber-500/20 bg-amber-500/5', 
            <Eye className="w-4 h-4 text-amber-500" />
          )
        }
        {(activeTab === 'all' || activeTab === 'gm') && 
          renderChecklist(
            'gm', 
            DEFAULT_GM_PERMISSIONS, 
            gmActive, 
            '2. General Manager', 
            'text-[#FF5F1F] border-[#FF5F1F]/20 bg-[#FF5F1F]/5', 
            <Users className="w-4 h-4 text-[#FF5F1F]" />
          )
        }
        {(activeTab === 'all' || activeTab === 'owner') && 
          renderChecklist(
            'owner', 
            DEFAULT_OWNER_PERMISSIONS, 
            ownerActive, 
            '3. Executive Owner', 
            'text-emerald-400 border-emerald-400/20 bg-emerald-400/5', 
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          )
        }
      </div>

      <div className="p-4 rounded-2xl bg-[#FF5F1F]/5 border border-[#FF5F1F]/15 flex items-start gap-3">
        <Lock className="w-4 h-4 text-app-accent flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-white/60 uppercase tracking-widest font-semibold leading-relaxed">
          Security Restriction Protocol: These toggles establish high-fidelity rules. Changes directly affect real-time API policy and structural dashboard scopes. Under executive audit standards, Tenant levels exclude management controls.
        </p>
      </div>
    </div>
  );
};
