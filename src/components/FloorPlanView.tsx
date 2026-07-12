import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  User, 
  Calendar, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Send, 
  X, 
  Info, 
  CheckCircle, 
  ChevronRight,
  Plus,
  Mail,
  Building,
  HelpCircle
} from 'lucide-react';

interface RentRollItem {
  id: number;
  unit_number: string;
  rent_amount: number;
  status: string;
  tenant_name: string | null;
  tenant_id: number | null;
  lease_end: string | null;
  balance_due: number;
  needs_reply: number;
  last_tenant_activity_at: string | null;
  property_id: number;
  property_name: string | null;
}

interface MaintenanceRequest {
  id: number;
  unit_id: number;
  description: string;
  status: string;
  created_at: string;
  is_emergency?: number;
}

interface FloorPlanViewProps {
  propertyId?: number;
  onSelectUnit?: (unit: RentRollItem) => void;
}

export const FloorPlanView: React.FC<FloorPlanViewProps> = ({ propertyId = 1 }) => {
  const [units, setUnits] = useState<RentRollItem[]>([]);
  const [allMaintenance, setAllMaintenance] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<RentRollItem | null>(null);
  
  // Interactive action forms state
  const [quickMaintDesc, setQuickMaintDesc] = useState('');
  const [quickMaintSeverity, setQuickMaintSeverity] = useState('Normal');
  const [maintSubmitting, setMaintSubmitting] = useState(false);
  const [maintSubmitted, setMaintSubmitted] = useState(false);

  const [messageContent, setMessageContent] = useState('');
  const [msgSubmitting, setMsgSubmitting] = useState(false);
  const [msgSubmitted, setMsgSubmitted] = useState(false);

  // Fetch all units and maintenance requests
  const fetchData = async () => {
    setLoading(true);
    try {
      const [unitsRes, maintRes] = await Promise.all([
        fetch('/api/rent-roll'),
        fetch('/api/maintenance')
      ]);
      const unitsData = await unitsRes.json();
      const maintData = await maintRes.json();
      
      // Filter units by propertyId
      const filteredUnits = unitsData.filter((u: any) => u.property_id === propertyId);
      setUnits(filteredUnits);
      setAllMaintenance(maintData);
    } catch (error) {
      console.error('Error loading floor plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId]);

  // Handle unit selection and clear action states
  const handleSelectUnit = (unit: RentRollItem) => {
    setSelectedUnit(unit);
    setQuickMaintDesc('');
    setQuickMaintSeverity('Normal');
    setMaintSubmitted(false);
    setMessageContent('');
    setMsgSubmitted(false);
  };

  // Submit quick maintenance request
  const handleQuickMaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !quickMaintDesc.trim()) return;
    setMaintSubmitting(true);
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedUnit.id,
          description: `[${quickMaintSeverity.toUpperCase()}] ${quickMaintDesc}`,
          photo_url: null,
          is_emergency: quickMaintSeverity === 'Emergency' ? 1 : 0
        })
      });
      if (response.ok) {
        setQuickMaintDesc('');
        setMaintSubmitted(true);
        // Refresh data
        const [unitsRes, maintRes] = await Promise.all([
          fetch('/api/rent-roll'),
          fetch('/api/maintenance')
        ]);
        const unitsData = await unitsRes.json();
        const maintData = await maintRes.json();
        const filteredUnits = unitsData.filter((u: any) => u.property_id === propertyId);
        setUnits(filteredUnits);
        setAllMaintenance(maintData);
        // Update selected unit references
        const updatedUnit = filteredUnits.find((u: any) => u.id === selectedUnit.id);
        if (updatedUnit) setSelectedUnit(updatedUnit);
      }
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
    } finally {
      setMaintSubmitting(false);
    }
  };

  // Submit quick direct message to tenant
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !messageContent.trim()) return;
    setMsgSubmitting(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedUnit.id,
          sender: 'Manager',
          content: messageContent
        })
      });
      if (response.ok) {
        setMessageContent('');
        setMsgSubmitted(true);
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setMsgSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-app-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-app-text/40 tracking-wider uppercase">Loading Architectural Blueprints...</p>
      </div>
    );
  }

  // Group units by Floor
  // Ruby street has units like 101..108, 201..208, 301..308
  // If property doesn't have floors, group all in floor 1
  const floorUnits = units.filter(u => {
    const firstChar = u.unit_number.charAt(0);
    const floorNum = parseInt(firstChar);
    if (isNaN(floorNum)) return activeFloor === 1; // fallback
    return floorNum === activeFloor;
  });

  // Sort units by unit number so x01 to x08 are positioned logically
  const sortedFloorUnits = [...floorUnits].sort((a, b) => a.unit_number.localeCompare(b.unit_number));

  // Determine active maintenance requests for a unit
  const getUnitMaintenance = (unitId: number) => {
    return allMaintenance.filter(m => m.unit_id === unitId && m.status !== 'Completed');
  };

  // Days remaining calculation helper
  const getDaysRemaining = (dateStr: string | null) => {
    if (!dateStr) return null;
    const end = new Date(dateStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // Divide units into top row (e.g. x01 - x04) and bottom row (e.g. x05 - x08) for horizontal corridor layout
  const topRowUnits = sortedFloorUnits.slice(0, Math.ceil(sortedFloorUnits.length / 2));
  const bottomRowUnits = sortedFloorUnits.slice(Math.ceil(sortedFloorUnits.length / 2));

  return (
    <div className="space-y-8" id="interactive-floorplan">
      {/* Overview stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Units on Floor', value: floorUnits.length, color: 'text-app-text' },
          { label: 'Occupied', value: floorUnits.filter(u => u.status === 'Occupied').length, color: 'text-emerald-500' },
          { label: 'Vacant / Available', value: floorUnits.filter(u => u.status !== 'Occupied').length, color: 'text-app-accent' },
          { label: 'Pending Maintenance', value: floorUnits.reduce((acc, u) => acc + getUnitMaintenance(u.id).length, 0), color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-3xl bg-app-card border border-app-border flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-app-text/40">{stat.label}</span>
            <span className={`text-2xl font-serif font-black mt-1 ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Control Bar: Floor selection */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-app-card p-4 rounded-[2rem] border border-app-border gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-app-accent/10 rounded-xl text-app-accent">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-app-accent font-mono">
              Floor Plan Navigator
            </h4>
            <p className="text-xs text-app-text/50">Interactive Suite Architecture & Tenant Hub</p>
          </div>
        </div>

        {/* Floor Switcher Tabs with Layout Animation */}
        <div className="flex bg-app-bg/50 p-1.5 rounded-2xl border border-app-border/40 relative z-10">
          {[1, 2, 3].map((floor) => {
            const isActive = activeFloor === floor;
            return (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={`relative px-6 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  isActive ? 'text-app-bg font-extrabold' : 'text-app-text/60 hover:text-app-text'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFloorIndicator"
                    className="absolute inset-0 bg-app-accent rounded-xl z-[-1] shadow-md shadow-app-accent/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                Floor {floor}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Floor Blueprint Container */}
      <div className="bg-app-card rounded-[2.5rem] border-2 border-app-border p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative Grid Lines to give that "Architectural Blueprint" vibe */}
        <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-[0.03]">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="border-r border-app-text h-full" />
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-6 pointer-events-none opacity-[0.03]">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="border-b border-app-text w-full" />
          ))}
        </div>

        {/* Outer Shell Wrapper for Floorplan */}
        <div className="relative min-h-[460px] flex flex-col justify-between gap-8 z-10 select-none overflow-x-auto">
          <div className="min-w-[800px] py-4 flex flex-col justify-between h-full gap-8">
            
            {/* TOP ROW UNITS (e.g. 101 - 104) */}
            <div className="grid grid-cols-4 gap-4 flex-grow">
              {topRowUnits.map((unit) => {
                const activeMaint = getUnitMaintenance(unit.id);
                const isSelected = selectedUnit?.id === unit.id;
                return (
                  <motion.div
                    key={unit.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectUnit(unit)}
                    className={`h-40 rounded-3xl border-2 p-5 flex flex-col justify-between transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'bg-app-accent/10 border-app-accent shadow-inner'
                        : unit.status === 'Occupied'
                        ? 'bg-app-bg/40 border-app-border/70 hover:border-app-accent/30'
                        : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50'
                    }`}
                  >
                    {/* Architectural Room Dividers */}
                    <div className="absolute inset-x-0 bottom-1/3 border-b border-dashed border-app-border/10 pointer-events-none" />
                    <div className="absolute inset-y-0 left-1/3 border-r border-dashed border-app-border/10 pointer-events-none" />

                    {/* Unit header info */}
                    <div className="flex items-start justify-between z-10">
                      <div>
                        <span className="text-2xl font-mono font-black tracking-tighter text-app-text">
                          {unit.unit_number}
                        </span>
                        <div className="text-[8px] font-bold font-mono text-app-text/30 uppercase mt-0.5 tracking-widest">
                          {unit.status === 'Occupied' ? 'Studio A' : 'Studio B'}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-1.5">
                        {activeMaint.length > 0 && (
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30" title={`${activeMaint.length} Active Repair Requests`}>
                            <Wrench className="w-3 h-3 animate-pulse" />
                          </div>
                        )}
                        <span className={`text-[8px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded-full border ${
                          unit.status === 'Occupied'
                            ? 'bg-app-text/5 text-app-text/70 border-app-border'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
                        }`}>
                          {unit.status === 'Occupied' ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>
                    </div>

                    {/* Micro blueprint content */}
                    <div className="z-10 flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-app-text/40 block">Rent Rate</span>
                        <span className="text-sm font-serif font-black text-app-text/90">${unit.rent_amount}</span>
                      </div>
                      
                      {unit.status === 'Occupied' && (
                        <div className="text-right">
                          <span className="text-[8px] font-bold uppercase tracking-wider font-mono text-app-accent block">
                            {unit.tenant_name?.split(' ')[1] || 'Resident'}
                          </span>
                          {unit.balance_due > 0 && (
                            <span className="text-[9px] font-bold font-mono text-red-500 animate-pulse">
                              Due: ${unit.balance_due}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CENTRAL CORRIDOR RUNNING HORIZONTALLY */}
            <div className="h-16 bg-app-bg/80 border-y-2 border-dashed border-app-border/40 rounded-xl flex items-center justify-between px-8 relative overflow-hidden">
              {/* Corridor texture lines */}
              <div className="absolute inset-y-0 left-10 w-[2px] bg-app-border/20" />
              <div className="absolute inset-y-0 right-10 w-[2px] bg-app-border/20" />

              {/* STAIRS AND ELEVATOR (LEFT END) */}
              <div className="flex items-center gap-6 z-10">
                <div className="flex flex-col items-center justify-center border border-app-border/50 bg-app-card px-3.5 py-1 rounded-lg text-app-text/40 font-mono text-[9px] font-black uppercase tracking-wider shadow-sm">
                  <span>STAIRS</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="w-1 h-1.5 border-r border-t border-app-text/30" />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border border-app-border/50 bg-app-card px-3.5 py-1 rounded-lg text-app-text/40 font-mono text-[9px] font-black uppercase tracking-wider shadow-sm">
                  <span>LIFT</span>
                  <div className="w-4 h-1 border border-app-text/30 mt-1 flex items-center justify-center gap-0.5">
                    <div className="w-1.5 h-full bg-app-text/20" />
                    <div className="w-1.5 h-full bg-app-text/20" />
                  </div>
                </div>
              </div>

              {/* CENTRAL CORRIDOR TEXT */}
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-app-text/20">
                Main Sky-Bridge Corridor & Service Shaft
              </span>

              {/* EMERGENCY OUTLET (RIGHT END) */}
              <div className="z-10">
                <div className="border border-red-500/30 bg-red-500/5 px-3 py-1 rounded-lg text-red-400 font-mono text-[8px] font-bold uppercase tracking-widest">
                  EMERGENCY EXIT
                </div>
              </div>
            </div>

            {/* BOTTOM ROW UNITS (e.g. 105 - 108) */}
            <div className="grid grid-cols-4 gap-4 flex-grow">
              {bottomRowUnits.map((unit) => {
                const activeMaint = getUnitMaintenance(unit.id);
                const isSelected = selectedUnit?.id === unit.id;
                return (
                  <motion.div
                    key={unit.id}
                    whileHover={{ scale: 1.02, y: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectUnit(unit)}
                    className={`h-40 rounded-3xl border-2 p-5 flex flex-col justify-between transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'bg-app-accent/10 border-app-accent shadow-inner'
                        : unit.status === 'Occupied'
                        ? 'bg-app-bg/40 border-app-border/70 hover:border-app-accent/30'
                        : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50'
                    }`}
                  >
                    {/* Architectural Room Dividers */}
                    <div className="absolute inset-x-0 top-1/3 border-b border-dashed border-app-border/10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-1/3 border-r border-dashed border-app-border/10 pointer-events-none" />

                    {/* Unit header info */}
                    <div className="flex items-start justify-between z-10">
                      <div>
                        <span className="text-2xl font-mono font-black tracking-tighter text-app-text">
                          {unit.unit_number}
                        </span>
                        <div className="text-[8px] font-bold font-mono text-app-text/30 uppercase mt-0.5 tracking-widest">
                          {unit.status === 'Occupied' ? 'Studio A' : 'Studio B'}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-1.5">
                        {activeMaint.length > 0 && (
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30" title={`${activeMaint.length} Active Repair Requests`}>
                            <Wrench className="w-3 h-3 animate-pulse" />
                          </div>
                        )}
                        <span className={`text-[8px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded-full border ${
                          unit.status === 'Occupied'
                            ? 'bg-app-text/5 text-app-text/70 border-app-border'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
                        }`}>
                          {unit.status === 'Occupied' ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>
                    </div>

                    {/* Micro blueprint content */}
                    <div className="z-10 flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-app-text/40 block">Rent Rate</span>
                        <span className="text-sm font-serif font-black text-app-text/90">${unit.rent_amount}</span>
                      </div>
                      
                      {unit.status === 'Occupied' && (
                        <div className="text-right">
                          <span className="text-[8px] font-bold uppercase tracking-wider font-mono text-app-accent block">
                            {unit.tenant_name?.split(' ')[1] || 'Resident'}
                          </span>
                          {unit.balance_due > 0 && (
                            <span className="text-[9px] font-bold font-mono text-red-500 animate-pulse">
                              Due: ${unit.balance_due}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Side-Drawer Modal for Detailed Unit Management */}
      <AnimatePresence>
        {selectedUnit && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUnit(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-app-card border-l border-app-border p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-mono font-black text-app-text">
                      Suite {selectedUnit.unit_number}
                    </span>
                    <span className={`text-xs font-black uppercase tracking-wider font-mono px-3 py-1 rounded-full border ${
                      selectedUnit.status === 'Occupied'
                        ? 'bg-app-accent/10 text-app-accent border-app-accent/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {selectedUnit.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedUnit(null)}
                    className="p-2 rounded-full hover:bg-app-text/5 text-app-text/50 hover:text-app-text transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-xs text-app-text/40 font-mono uppercase tracking-widest">
                  3875 Ruby Street, Oakland • Floor {activeFloor} Flagship Layout
                </p>
                <hr className="border-app-border/40" />
              </div>

              {/* Body Details */}
              <div className="flex-grow py-6 space-y-6 overflow-y-auto pr-1">
                {/* 1. Occupancy & Tenant Card */}
                <div className="p-5 bg-app-bg/50 border border-app-border rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-app-accent font-mono">
                    <User className="w-3.5 h-3.5" />
                    <span>Occupancy & Contract Info</span>
                  </div>
                  
                  {selectedUnit.status === 'Occupied' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-app-text/40 block">Tenant Name</span>
                        <span className="text-base font-serif font-bold text-app-text">{selectedUnit.tenant_name}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-app-text/40 block">Lease Expiration</span>
                        <div className="flex items-center gap-1.5 text-app-text">
                          <Calendar className="w-4 h-4 text-app-text/40" />
                          <span className="text-sm font-bold">{selectedUnit.lease_end || 'Month-to-month'}</span>
                        </div>
                        {selectedUnit.lease_end && (
                          <span className={`text-[10px] font-bold font-mono block ${
                            (getDaysRemaining(selectedUnit.lease_end) || 0) < 30 ? 'text-red-400' : 'text-emerald-500'
                          }`}>
                            ({getDaysRemaining(selectedUnit.lease_end)} days remaining)
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center space-y-2">
                      <p className="text-sm text-app-text/70 italic">Suite is currently vacant and clean.</p>
                      <span className="inline-block text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase animate-pulse">
                        Ready for Showings
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Financial Ledger Card */}
                <div className="p-5 bg-app-bg/50 border border-app-border rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-app-accent font-mono">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Financial Overview</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-app-text/40 block">Contractual Rent</span>
                      <span className="text-xl font-serif font-black text-app-text">${selectedUnit.rent_amount} <span className="text-[10px] text-app-text/40 font-mono">/mo</span></span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-app-text/40 block">Outstanding Balance</span>
                      <span className={`text-xl font-serif font-black ${selectedUnit.balance_due > 0 ? 'text-red-400' : 'text-emerald-500'}`}>
                        ${selectedUnit.balance_due}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Maintenance Requests for the unit */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-app-accent font-mono">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Maintenance & Repairs</span>
                    </div>
                    <span className="text-[10px] bg-app-text/5 border border-app-border px-2.5 py-0.5 rounded-full font-mono font-bold text-app-text/60">
                      {getUnitMaintenance(selectedUnit.id).length} Active
                    </span>
                  </div>

                  <div className="space-y-3">
                    {getUnitMaintenance(selectedUnit.id).length > 0 ? (
                      getUnitMaintenance(selectedUnit.id).map((req) => (
                        <div key={req.id} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-xs text-app-text font-bold leading-relaxed">{req.description}</p>
                            <span className="text-[9px] font-mono font-bold text-app-text/40 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              Filed: {new Date(req.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            req.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-app-text/40 italic bg-app-bg/20 border border-app-border/40 rounded-xl">
                        No active maintenance requests recorded for this unit.
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Action forms */}
                <div className="border-t border-app-border/40 pt-6 space-y-6">
                  {/* Maintenance Request Submission Form */}
                  <form onSubmit={handleQuickMaintSubmit} className="space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-app-text/40 font-mono">
                      File Maintenance Ticket
                    </h5>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Broken corridor light bulb..."
                        value={quickMaintDesc}
                        onChange={(e) => setQuickMaintDesc(e.target.value)}
                        className="flex-grow px-4 py-2 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:ring-1 focus:ring-app-accent"
                        disabled={maintSubmitting}
                      />
                      
                      <select
                        value={quickMaintSeverity}
                        onChange={(e) => setQuickMaintSeverity(e.target.value)}
                        className="px-3 py-2 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none"
                        disabled={maintSubmitting}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Medium">Medium</option>
                        <option value="Emergency">Emergency 🚨</option>
                      </select>

                      <button
                        type="submit"
                        className="p-2 bg-app-accent hover:bg-app-accent/90 text-app-bg font-bold rounded-xl text-xs flex items-center justify-center transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                        disabled={maintSubmitting || !quickMaintDesc.trim()}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {maintSubmitted && (
                      <span className="text-[10px] font-mono font-bold text-emerald-500 block">
                        ✓ Maintenance request added successfully!
                      </span>
                    )}
                  </form>

                  {/* Message to Tenant dispatch Form */}
                  {selectedUnit.status === 'Occupied' && (
                    <form onSubmit={handleSendMessage} className="space-y-3">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-app-text/40 font-mono">
                        Send Direct Message to Resident
                      </h5>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`Message ${selectedUnit.tenant_name?.split(' ')[0] || 'Resident'}...`}
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          className="flex-grow px-4 py-2 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:ring-1 focus:ring-app-accent"
                          disabled={msgSubmitting}
                        />

                        <button
                          type="submit"
                          className="p-2 bg-app-accent hover:bg-app-accent/90 text-app-bg font-bold rounded-xl text-xs flex items-center justify-center transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                          disabled={msgSubmitting || !messageContent.trim()}
                        >
                          <Send className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {msgSubmitted && (
                        <span className="text-[10px] font-mono font-bold text-emerald-500 block">
                          ✓ Message dispatched into Tenant communication hub!
                        </span>
                      )}
                    </form>
                  )}
                </div>
              </div>

              {/* Footer details */}
              <div className="pt-4 border-t border-app-border/40 flex items-center justify-between text-[9px] font-mono text-app-text/40">
                <span>DATABASE REF: UNIT_ID_{selectedUnit.id}</span>
                <span>RENT-RUBY OPERATIONAL MATRIX</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
