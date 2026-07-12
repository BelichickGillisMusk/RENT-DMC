import React, { useState, useEffect } from 'react';
import { 
  Hospital, 
  ShieldCheck, 
  Heart, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Check, 
  ArrowLeft,
  X,
  Stethoscope,
  Building,
  User,
  Users,
  Calendar,
  Waves,
  Moon,
  Eye,
  Camera,
  Activity,
  Shield,
  Coffee,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface TravelNursePortalProps {
  onBack: () => void;
}

interface CameraFeed {
  id: string;
  location: string;
  status: 'All Clear' | 'Motion Detected' | 'Scanning';
  objectDetected: string;
  lastTested: string;
}

export const TravelNursePortal: React.FC<TravelNursePortalProps> = ({ onBack }) => {
  const hospitals = [
    { name: "Kaiser Permanente Oakland", dist: "0.4 miles", time: "3 min drive / 8 min walk", notes: "Immediate fast-track medical district neighbors." },
    { name: "Summit Medical Center", dist: "0.8 miles", time: "5 min drive / 15 min walk", notes: "Surgical and emergency specialist center." },
    { name: "Alta Bates Highland Hospital", dist: "1.2 miles", time: "7 min drive", notes: "Level 1 Trauma & county referral hub." },
    { name: "Benioff Children's Hospital", dist: "1.5 miles", time: "8 min drive", notes: "Pediatric critical care & research center." }
  ];

  // AI Security Camera local interactive state for night shifts
  const [selectedCam, setSelectedCam] = useState<string>('c1');
  const [motionTriggered, setMotionTriggered] = useState<boolean>(false);
  const [scanningLine, setScanningLine] = useState<number>(0);

  const cameraFeeds: CameraFeed[] = [
    { id: 'c1', location: 'West Courtyard Access', status: 'All Clear', objectDetected: 'No activity — path lit', lastTested: '2 min ago' },
    { id: 'c2', location: 'Gated Medical Parking Bay', status: 'Scanning', objectDetected: 'Secure credentialed vehicles only', lastTested: 'Just now' },
    { id: 'c3', location: 'Ruby Street Secured Lobby', status: 'All Clear', objectDetected: 'Double-locked smart entry safe', lastTested: '5 min ago' },
    { id: 'c4', location: 'Laundry & Zen Lounge Link', status: 'Motion Detected', objectDetected: 'Night nurse grabbing post-shift brew', lastTested: '10s ago' },
  ];

  // Interactivity pulse for AI camera
  useEffect(() => {
    const timer = setInterval(() => {
      setMotionTriggered(prev => !prev);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20 selection:bg-rose-500/10">
      
      {/* Top Sterile Navigation Bar */}
      <div className="bg-white border-b border-rose-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#FF5F1F] hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/50 px-3 py-2 rounded-full transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Hub
            </button>
            <div className="w-px h-5 bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-rose-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Travel Nurse Sanctuary</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-700 bg-amber-500/15 px-3 py-1 border border-amber-300 rounded-full flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-600" /> Gold Standard Housing // Certified 2026
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-16">
        <div className="space-y-16">
          
          {/* Main Hero Banner with Clinical sterile styling */}
          <div className="relative p-8 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-white via-white to-rose-50/20 border border-rose-100 shadow-xl shadow-rose-950/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.25em] rounded-full shadow-md shadow-rose-600/10">
                <Heart className="w-3.5 h-3.5" /> Direct Hospital Link
              </div>
              
              <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tight text-slate-900 leading-none">
                SANCTUARY FOR <br />
                <span className="text-rose-600 italic font-serif">OAKLAND’S BEST.</span>
              </h1>
              
              <p className="text-base text-slate-600 font-medium max-w-xl leading-relaxed">
                Welcome to Nest Nurse at 3875 Ruby Street. We've replaced dark tech-gradients with clean, light-filled, sound-insulated suites. Located precisely in the center of Oakland's core medical corridor, providing stress-free proximity.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-700 rounded-xl">
                  <Moon className="w-3.5 h-3.5 text-rose-600" /> Quiet Night protocol
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-700 rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Gated Parking
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-700 rounded-xl">
                  <Waves className="w-3.5 h-3.5 text-sky-600" /> Hypoallergenic Sanitized
                </span>
              </div>
            </div>
          </div>

          {/* Two Column Layout: Proximity Cards & The Safe Nurse Contract Guarantee */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Hospital Proximity Module - sterile checklist */}
            <div className="bg-white border border-slate-200/80 p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <Hospital className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900">Hospital Proximity Index</h3>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black block mt-0.5">Oakland Medical Corridor</span>
                </div>
              </div>

              <div className="space-y-4">
                {hospitals.map((h, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-sm font-black text-slate-900 block leading-tight">{h.name}</span>
                      <p className="text-[10px] text-slate-500 font-medium">{h.notes}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-rose-600 block uppercase tracking-tight">{h.dist}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">{h.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Gold & Red Nurse Contract Benefits */}
            <div className="bg-white border-2 border-amber-400/60 p-8 md:p-10 rounded-[2.5rem] shadow-lg shadow-amber-500/5 flex flex-col justify-between relative overflow-hidden">
              {/* Gold Vintage Crest Element */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none" />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">The 2026 Nurse Clause</h3>
                      <span className="text-[9px] text-amber-700 uppercase tracking-widest font-black block mt-0.5">Custom Shift Contract Benefits</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/15 border border-amber-300 text-amber-700 text-[8px] font-black uppercase tracking-wider rounded-xl">
                    Gold Tier
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-semibold italic border-l-4 border-rose-500 pl-4 bg-rose-50/30 py-3 rounded-r-xl">
                  "Every lease is designed with clinical schedules in mind. If your official hospital contract gets canceled or moved, you receive a penalization-free 30-day exit privilege."
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "13-Week Standard Contracts",
                    "No Penalty Termination",
                    "Direct Billing Accepted",
                    "Post-Shift Wellness Hub",
                    "Hypoallergenic Linen Kit",
                    "Private Gated Parking Access"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-700">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {feat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instant Shift Claim Form Hook */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">Contract Intake</span>
                  <span className="text-[11px] font-bold text-[#FF5F1F]">hello@rent-ruby.com</span>
                </div>
                <span className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-rose-600/15 transition-all text-center select-none block">
                  Verify Credentials
                </span>
              </div>
            </div>

          </div>

          {/* AI Security Camera Section: Beautiful Sterile & Friendly Guard Camera Center */}
          <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-[2.5rem] shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-400/20 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> AI GUARDIAN ACTIVE
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">● Courtyard Optics Enabled</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-rose-600" /> AI Camera Safespace Live
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  24/7 Deep-learning optical surveillance. Providing medical staff safe entry at any shift hour.
                </p>
              </div>

              {/* General safety status */}
              <div className="flex gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[120px]">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Property Threat Index</span>
                  <span className="text-lg font-black text-emerald-500 uppercase tracking-wider block mt-0.5">0.0 (SAFE)</span>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center min-w-[120px]">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Lobby Access Guard</span>
                  <span className="text-lg font-black text-rose-600 uppercase tracking-wider block mt-0.5">DOUBLE LOCKED</span>
                </div>
              </div>
            </div>

            {/* Safe Screen / Camera grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Interactive Feed Stream */}
              <div className="lg:col-span-8 bg-slate-950 rounded-[2rem] border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                {/* Vintage retro camera scan lines overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90.1deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-15 opacity-60" />

                {/* Status Bar */}
                <div className="relative z-10 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      FEED // {cameraFeeds.find(c => c.id === selectedCam)?.location}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    [OPTICS: HD 4K 2026]
                  </span>
                </div>

                {/* Animated Scanner Overlays and graphics */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-full h-0.5 bg-emerald-500/30 shadow-[0_0_10px_#10B981] animate-[pulse_1s_infinite]" />
                </div>

                {/* Center visual text (surveillance style) */}
                <div className="my-12 text-center space-y-3 z-10 relative">
                  <Activity className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                  <div className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/40 px-4 py-1.5 rounded-full inline-block border border-emerald-500/20">
                    STATUS: {cameraFeeds.find(c => c.id === selectedCam)?.status}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase max-w-sm mx-auto">
                    AI TARGET: {cameraFeeds.find(c => c.id === selectedCam)?.objectDetected}
                  </p>
                </div>

                {/* Diagnostics and timestamps footer */}
                <div className="relative z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl flex justify-between items-center font-mono text-[9px] text-slate-400">
                  <span>LATENCY: 12ms</span>
                  <span>OAKLAND MEDICAL GRID // SAFE_MODE_ACTIVE</span>
                </div>

              </div>

              {/* Feed Selection List */}
              <div className="lg:col-span-4 space-y-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Select Active Camera Angle</span>
                
                {cameraFeeds.map((feed) => {
                  const isActive = selectedCam === feed.id;
                  return (
                    <button
                      key={feed.id}
                      onClick={() => setSelectedCam(feed.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer block ${
                        isActive
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black uppercase tracking-wider">{feed.location}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${feed.status === 'Motion Detected' ? 'bg-amber-500' : feed.status === 'Scanning' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
                        <span className="font-mono">AI: {feed.status}</span>
                        <span>Tested {feed.lastTested}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Core Sterile Features Detail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-800">
            <div className="p-8 rounded-[2rem] bg-white border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-rose-600">
                <Moon className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-tight text-slate-900">Silent Zone Protocol</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold uppercase tracking-wider">
                Heavy blackout drapes and noise-rated windows are fully tested to ensure day-sleepers receive deep, restorative rest without interruption.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-rose-600">
                <Coffee className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-tight text-slate-900">Post-Shift Espresso Station</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold uppercase tracking-wider">
                A 24-hour gourmet organic coffee and tea nook features immediate single-serve pods for shift startups and decompression moments.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-rose-600">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-tight text-slate-900">Safe Gated Access</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold uppercase tracking-wider">
                Full lock-and-gate controls powered by credentials that are monitored 24/7, keeping your vehicles, gear, and privacy thoroughly secure.
              </p>
            </div>
          </div>

        </div>

        {/* Vintage Nurse-Uniform Colored Sterile Footer */}
        <div className="mt-24 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600" /> Ruby Street Medical Housing Program // Est. 2026
          </div>
          <div className="text-[10px] font-serif italic text-slate-500">
            Proudly backing our community's essential nurses with custom leasing, elite safety, and total quiet.
          </div>
        </div>
      </div>
    </div>
  );
};
