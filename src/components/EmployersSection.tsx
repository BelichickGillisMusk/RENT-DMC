import React from 'react';
import { motion } from 'motion/react';
import { Hospital, Building2, Train, School, Briefcase, Clock, MapPin, Bike, Car, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

interface Employer {
  name: string;
  category: string;
  icon: React.ComponentType<any>;
  commuteWalk: number; // minutes
  commuteBike: number; // minutes
  commuteTransit: number; // minutes
  commuteCar: number; // minutes
  hiringStatus: string;
  perk: string;
}

const employersData: Employer[] = [
  {
    name: 'Kaiser Permanente Medical Center',
    category: 'Healthcare & Research',
    icon: Hospital,
    commuteWalk: 6,
    commuteBike: 2,
    commuteTransit: 4,
    commuteCar: 2,
    hiringStatus: 'Major Medical Hub • 10,000+ local staff',
    perk: 'Direct neighbor, perfect for rotating medical residents'
  },
  {
    name: 'Sutter Health / Alta Bates Summit',
    category: 'Healthcare", Medical',
    icon: Hospital,
    commuteWalk: 12,
    commuteBike: 4,
    commuteTransit: 8,
    commuteCar: 3,
    hiringStatus: 'Pill Hill Campus • 5,000+ staff',
    perk: 'Walking distance, perfect for night-shift travel nurses'
  },
  {
    name: 'Bay Area Rapid Transit (BART)',
    category: 'Transit & Government',
    icon: Train,
    commuteWalk: 8,
    commuteBike: 3,
    commuteTransit: 2,
    commuteCar: 3,
    hiringStatus: 'MacArthur Station Hub',
    perk: 'Ultra-quick connection across the entire Bay Area'
  },
  {
    name: 'UC Berkeley / UCOP',
    category: 'Education & Admin',
    icon: School,
    commuteWalk: 45,
    commuteBike: 14,
    commuteTransit: 12,
    commuteCar: 10,
    hiringStatus: 'Major Public Employer',
    perk: 'Direct BART commute route (MacArthur to Downtown Berkeley)'
  },
  {
    name: 'The Clorox Company',
    category: 'Corporate Headquarters',
    icon: Building2,
    commuteWalk: 30,
    commuteBike: 9,
    commuteTransit: 10,
    commuteCar: 6,
    hiringStatus: 'Downtown Oakland Corporate Office',
    perk: 'Easy bike ride down Broadway or quick BART stop'
  }
];

export function EmployersSection() {
  return (
    <section id="employers" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 border-b border-app-border">
        <div className="max-w-2xl space-y-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-app-accent mb-2">Prime Commute Hub</div>
          <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-app-text">
            Connecting You to <span className="italic text-app-accent">Oakland's Giants</span>
          </h2>
          <p className="text-app-text/70 text-lg font-medium">
            3875 Ruby Street is strategically located steps from the East Bay's largest medical centers, universities, and corporate office headquarters.
          </p>
        </div>
        
        {/* Amazon Locker Highlight Unit */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-app-accent/5 border border-app-accent/20 rounded-[2rem] p-6 max-w-sm flex items-start gap-4 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-app-accent/10 rounded-full blur-3xl -z-10" />
          <div className="p-3 bg-app-accent/10 rounded-2xl text-app-accent">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold uppercase text-xs tracking-wider text-app-accent">Amazon Locker On Site</h4>
            <p className="text-sm font-black text-app-text">Secure package pickup 24/7 on property.</p>
            <p className="text-xs text-app-text/60">Fully monitored, on-site Amazon Hub locker guarantees that your deliveries are safe, dry, and always accessible.</p>
          </div>
        </motion.div>
      </div>

      {/* Styled Logos Grid of Major Employers */}
      <div className="space-y-6">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40">Distinguished Local Partners & Employers</div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'Kaiser', sub: 'Permanente', tag: 'Adjacent', color: 'border-blue-500/20 text-blue-500 bg-blue-500/5' },
            { name: 'Sutter', sub: 'Summit Medical', tag: 'Walking', color: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' },
            { name: 'BART', sub: 'MacArthur Station', tag: '0.4 miles', color: 'border-cyan-500/20 text-cyan-500 bg-cyan-500/5' },
            { name: 'UC', sub: 'Berkeley / UCOP', tag: 'Direct Line', color: 'border-amber-500/20 text-amber-500 bg-amber-500/5' },
            { name: 'Clorox', sub: 'Oakland HQ', tag: 'Downtown', color: 'border-zinc-500/20 text-zinc-500 bg-zinc-500/5' }
          ].map((logo) => (
            <div 
              key={logo.name}
              className={`p-6 border-2 rounded-[2rem] text-center flex flex-col justify-between items-center h-40 transition-all hover:scale-[1.03] shadow-sm hover:shadow-md ${logo.color}`}
            >
              <div className="space-y-1 mt-2">
                <div className="text-2xl font-black tracking-tight">{logo.name}</div>
                <div className="text-[9px] font-black uppercase tracking-wider opacity-60 leading-tight">{logo.sub}</div>
              </div>
              <span className="px-3 py-1 bg-white/60 dark:bg-white/5 border border-current/10 text-[9px] font-black uppercase tracking-widest rounded-full leading-none">
                {logo.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Commute Table */}
      <div className="bg-app-card border-2 border-app-border rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-app-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-app-text/5">
          <div>
            <h3 className="text-2xl font-serif font-black text-app-text">Proximity & Commute Analysis</h3>
            <p className="text-sm font-bold text-app-text/50">Calculated direct times from 3875 Ruby Street</p>
          </div>
          <div className="flex gap-4 text-xs font-bold text-app-text/70">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-app-accent" /> Active commuter-optimized route routing</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-app-border text-[9px] font-black uppercase tracking-widest text-app-text/40 bg-app-text/2">
                <th className="py-5 px-8">Employer / Center</th>
                <th className="py-5 px-4">Classification</th>
                <th className="py-5 px-4 text-center"><span className="inline-flex items-center gap-1"><Bike className="w-3.5 h-3.5 text-app-accent" /> Walk / Bike</span></th>
                <th className="py-5 px-4 text-center"><span className="inline-flex items-center gap-1"><Train className="w-3.5 h-3.5 text-app-accent" /> Transit</span></th>
                <th className="py-5 px-4 text-center"><span className="inline-flex items-center gap-1"><Car className="w-3.5 h-3.5 text-app-accent" /> Drive</span></th>
                <th className="py-5 px-8">Location Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border font-sans">
              {employersData.map((emp) => (
                <tr key={emp.name} className="hover:bg-app-text/2 transition-colors">
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-app-accent/10 text-app-accent flex items-center justify-center">
                        <emp.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-app-text leading-tight">{emp.name}</div>
                        <div className="text-xs text-app-text/50 mt-1 font-semibold">{emp.hiringStatus}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-app-text/5 border border-app-border px-2.5 py-1 rounded-md text-app-text/70">
                      {emp.category}
                    </span>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex justify-center items-center gap-3">
                      <div className="text-center">
                        <span className="text-sm font-black text-app-text">{emp.commuteWalk}m</span>
                        <span className="block text-[8px] font-black uppercase text-app-text/40">Walk</span>
                      </div>
                      <div className="w-px h-6 bg-app-border" />
                      <div className="text-center">
                        <span className="text-sm font-black text-app-text">{emp.commuteBike}m</span>
                        <span className="block text-[8px] font-black uppercase text-app-text/40">Bike</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <span className="text-sm font-black text-app-text bg-app-accent/5 px-3 py-1.5 rounded-full border border-app-accent/10">
                      {emp.commuteTransit} min
                    </span>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <span className="text-sm font-black text-app-text">
                      {emp.commuteCar} min
                    </span>
                  </td>
                  <td className="py-6 px-8 text-sm font-semibold text-app-text/70 leading-relaxed max-w-xs">
                    {emp.perk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
