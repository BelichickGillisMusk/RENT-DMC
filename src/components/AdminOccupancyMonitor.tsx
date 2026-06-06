import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Building, Users, Info, Sparkles, TrendingUp, RefreshCw, Eye } from 'lucide-react';

interface Unit {
  id: number;
  unit_number: string;
  status: string;
  rent_amount: number;
  tenant_name?: string | null;
}

export const AdminOccupancyMonitor: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/rent-roll');
      if (!res.ok) throw new Error('Failed to fetch rent roll data');
      const data = await res.json();
      setUnits(data);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError('Could not establish real-time connection to stadium servers.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleToggleStatus = async (unit: Unit) => {
    const newStatus = unit.status === 'Occupied' ? 'Vacant' : 'Occupied';
    setUpdatingId(unit.id);
    
    // Optimistic UI Update for maximum responsiveness
    setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, status: newStatus } : u));

    try {
      const res = await fetch(`/api/units/${unit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('PATCH failed');
    } catch (err) {
      console.error(err);
      // Revert optimistic UI update on error
      setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, status: unit.status } : u));
    } finally {
      setUpdatingId(null);
      // Trigger global recalculations or fresh data
      fetchUnits();
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-zinc-950 border border-white/10 rounded-[2.5rem] flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-app-accent animate-spin" />
          <p className="text-xs uppercase tracking-widest font-black text-white/50">Aggregating 24 residential telemetry...</p>
        </div>
      </div>
    );
  }

  const occupiedCount = units.filter(u => u.status === 'Occupied').length;
  const totalUnitsCount = units.length || 24;
  const occupancyPercentage = parseFloat(((occupiedCount / totalUnitsCount) * 100).toFixed(1));

  // Projected rent calculation
  const totalRent = units.reduce((acc, u) => acc + (u.status === 'Occupied' ? u.rent_amount : 0), 0);
  const vacantLoss = units.reduce((acc, u) => acc + (u.status === 'Vacant' ? u.rent_amount : 0), 0);

  return (
    <div className="p-8 md:p-10 bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
      {/* Visual background lights representing the Giants stadium design */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5F1F]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-ruby/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-[#FF5F1F]/15 border border-[#FF5F1F]/20 text-[#FF5F1F] text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
              Real-Time Telemetry
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">
            Residential Occupancy Monitor
          </h3>
          <p className="text-xs text-white/50 uppercase tracking-widest font-bold mt-1">
            Dynamic tracking for 24 luxury units at 3875 Ruby Street.
          </p>
        </div>

        {/* Quick Summary Numbers */}
        <div className="flex gap-6">
          <div className="text-right">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Live Ratio</span>
            <span className="text-2xl font-serif font-black italic text-[#FF5F1F]">{occupiedCount} <span className="text-white/30 text-sm">/ {totalUnitsCount} Units</span></span>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Live Revenue</span>
            <span className="text-2xl font-serif font-black italic text-emerald-400">${totalRent.toLocaleString()} <span className="text-white/30 text-xs">/ mo</span></span>
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#FF5F1F] block">Portfolio Occupancy</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-0.5">Updated in real-time on active toggles</span>
          </div>
          <div className="text-right">
            <motion.span 
              key={occupancyPercentage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-black text-white font-serif tracking-tight"
            >
              {occupancyPercentage}%
            </motion.span>
          </div>
        </div>

        {/* Dynamic track bar */}
        <div className="relative w-full h-4 bg-zinc-900 border border-white/10 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${occupancyPercentage}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 12 }}
            className="h-full bg-gradient-to-r from-ruby via-app-accent to-[#FF5F1F] rounded-full relative"
          >
            {/* Glossy shine */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          </motion.div>
        </div>

        {/* Indicators checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="text-white/70 font-semibold uppercase text-[10px] tracking-wider">Occupied: {occupiedCount} Units</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded bg-zinc-700" />
            <span className="text-white/70 font-semibold uppercase text-[10px] tracking-wider">Vacant: {totalUnitsCount - occupiedCount} Units</span>
          </div>
          <div className="flex items-center gap-2 text-xs justify-end md:justify-end">
            <span className="text-ruby text-[9px] font-black uppercase tracking-widest bg-ruby/5 px-2.5 py-1 border border-ruby/15 rounded-full">
              Vacant Rent Risk: -${vacantLoss.toLocaleString()} / mo
            </span>
          </div>
        </div>
      </div>

      {/* The 24-Unit Interactive Telemetry Grid */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 flex items-center gap-2">
          <Building className="w-4 h-4 text-app-accent" /> Click any unit to toggle occupancy state
        </h4>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {units.map((unit) => {
            const isOccupied = unit.status === 'Occupied';
            const isUpdating = updatingId === unit.id;

            return (
              <button
                key={unit.id}
                onClick={() => handleToggleStatus(unit)}
                disabled={isUpdating}
                className={`relative p-3.5 rounded-2xl border transition-all text-left group overflow-hidden cursor-pointer ${
                  isOccupied
                    ? 'bg-[#FF5F1F]/5 hover:bg-[#FF5F1F]/10 border-[#FF5F1F]/15 hover:border-[#FF5F1F]/30'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Active glow backing on group hover */}
                {isOccupied && (
                  <div className="absolute top-0 right-0 w-10 h-10 bg-[#FF5F1F]/10 rounded-full blur-md opacity-40 group-hover:opacity-100 transition-opacity" />
                )}

                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-black font-serif tracking-tight text-white block">
                    {unit.unit_number}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-[#FF5F1F] animate-pulse' : 'bg-white/20'}`} />
                </div>

                <div className="space-y-1">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isOccupied ? 'text-app-accent' : 'text-white/30'}`}>
                    {isUpdating ? 'Saving...' : unit.status}
                  </span>
                  <span className="text-[9px] font-mono font-bold block text-white/40">
                    ${(unit.rent_amount / 1000).toFixed(1)}k
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
