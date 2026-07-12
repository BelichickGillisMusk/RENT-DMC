import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Train, 
  Hospital, 
  TreePine, 
  Coffee, 
  Sparkles, 
  Compass, 
  Eye, 
  Layers, 
  ArrowRight, 
  Clock, 
  Bike, 
  Navigation,
  CheckCircle2,
  Bookmark,
  Info
} from 'lucide-react';

interface Landmark {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  commute: string;
  col: string;
  glowCol: string;
  x: number;
  y: number;
  icon: React.ComponentType<any>;
  details: string[];
}

const radarLandmarks = [
  { name: 'Mosswood Park', dist: 0.1, angle: -45, icon: TreePine },
  { name: 'MacArthur BART', dist: 0.4, angle: 120, icon: Train },
  { name: 'Kaiser Permanente', dist: 0.3, angle: 30, icon: Hospital },
  { name: 'Piedmont Ave', dist: 0.6, angle: 210, icon: Coffee },
  { name: 'Alta Bates Summit', dist: 0.5, angle: 300, icon: Hospital },
  { name: 'The Fox Theater', dist: 0.8, angle: 180, icon: Sparkles },
  { name: "Drake's Dealership", dist: 0.7, angle: 160, icon: Coffee },
  { name: 'Lake Merritt', dist: 1.2, angle: 90, icon: MapPin }
];

const mainLandmarks: Landmark[] = [
  {
    id: 'ruby',
    name: 'Rent-Ruby (3875 Ruby St)',
    tagline: 'THE EPICENTER OF MOSSWOOD',
    desc: 'Only 2 units remaining. This historic landmark occupies an elite high-demand corner, providing a peaceful botanical garden setting directly feeding into Oakland\'s largest employment circles.',
    commute: 'Epicenter of commute vectors',
    col: '#FF5F1F', // Ruby orange-red
    glowCol: 'rgba(255, 95, 31, 0.4)',
    x: 230,
    y: 200,
    icon: MapPin,
    details: ['EST. 1924', 'Dual secure access security gating', 'Smart home automation equipped', 'Mosswood Community hub'],
  },
  {
    id: 'pixar',
    name: 'Pixar Animation Studios',
    tagline: 'GLOBAL INNOVATION & MEDIA INCUBATOR',
    desc: 'The iconic Academy Award-winning computer animation powerhouse. Nestled just across the Emeryville border, they channel creative and cultural talent directly into our immediate district.',
    commute: '5 min drive • 12 min bike commute',
    col: '#00D2C4', // Electric Teal
    glowCol: 'rgba(0, 210, 196, 0.4)',
    x: 180,
    y: 60,
    icon: Sparkles,
    details: ['2.1 Miles away', 'Creative landmark partner', 'Global talent anchor', 'Historic studio campus'],
  },
  {
    id: 'childrens',
    name: 'Children\'s Hospital Oakland',
    tagline: 'UCSF BENIOFF PEDIATRIC MEDICAL TOWER',
    desc: 'Nationally ranked tier-1 pediatric clinic and research powerhouse. Houses thousands of active physicians, medical researchers, and represents a premier destination for traveling clinical specialists.',
    commute: '4 min drive • 8 min walk',
    col: '#FF3B30', // Medical Red
    glowCol: 'rgba(255, 59, 48, 0.4)',
    x: 650,
    y: 90,
    icon: Hospital,
    details: ['0.6 Miles away', 'Primary medical partner', 'Travel nurse housing feeder', 'Nationally award-winning clinic'],
  },
  {
    id: 'altabates',
    name: 'Alta Bates Summit Medical Center',
    tagline: 'OAKLAND PILL HILL DISTRICT COMMAND FLAGSHIP',
    desc: 'The colossal epicentre of East Bay clinical services. A key employer driving immense local growth and medical corridor routing, providing thousands of vital local nursing and researcher roles.',
    commute: '3 min drive • 12 min walk',
    col: '#FF2D55', // Vibrant Magenta
    glowCol: 'rgba(255, 45, 85, 0.4)',
    x: 410,
    y: 470,
    icon: Hospital,
    details: ['0.5 Miles away', 'Primary local employer', '10k+ active medical personnel', 'Modernized research wards'],
  },
  {
    id: 'mosswood',
    name: 'Mosswood Park & Recreation',
    tagline: 'OAKLAND\'S CENTURY-OLD GREEN SHIELD',
    desc: '4 acres of lush botanical canopy, containing historic redwood groves, municipal dog arenas, freshly renovated tennis courts, and peaceful trails.',
    commute: '1 min walk • steps from your door',
    col: '#34C759', // Emerald Green
    glowCol: 'rgba(52, 199, 89, 0.4)',
    x: 540,
    y: 360,
    icon: TreePine,
    details: ['0.1 Miles away', 'Tennis & sport courts', 'Oakland historic canopy', 'Lush botanical redwood groves'],
  },
  {
    id: 'dining',
    name: 'Temescal & Piedmont Ave Food Strip',
    tagline: 'MICHELIN-RATED CULINARY CORRIDOR',
    desc: 'Bursting with cozy local coffee labs, legendary artisan pizzerias (including Drake\'s Dealership), vintage cinemas, and Michelin-recognized street food popups.',
    commute: '2 min drive • 8 min walk',
    col: '#FF9500', // Gold Orange
    glowCol: 'rgba(255, 149, 0, 0.4)',
    x: 720,
    y: 300,
    icon: Coffee,
    details: ['0.4 Miles away', 'Drakes Dealership walk', 'Oakland foodie epicentre', 'Artisan coffee labs'],
  }
];

export const NeighborhoodRadiusMap = () => {
  const [viewMode, setViewMode] = useState<'drone' | 'radar'>('drone');
  const [activeLandmark, setActiveLandmark] = useState<Landmark>(mainLandmarks[0]);
  const [hoveredLandmarkId, setHoveredLandmarkId] = useState<string | null>(null);

  return (
    <div className="w-full bg-app-card border-2 border-app-border rounded-[2.5rem] shadow-2xl p-6 lg:p-8 space-y-6 overflow-hidden relative">
      {/* Visual background atmospheric overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-app-bg/10 via-transparent to-app-accent/[0.02] pointer-events-none" />

      {/* Header Controller Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-app-border pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-app-accent mb-1.5">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">Location Command Dome</span>
          </div>
          <h3 className="text-2xl font-serif font-black text-app-text flex items-center gap-2">
            The Golden Mosswood Triangle
          </h3>
        </div>

        {/* Glossy Toggler */}
        <div className="flex bg-app-text/5 border border-app-border p-1 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewMode('drone')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              viewMode === 'drone'
                ? 'bg-app-accent text-white shadow-lg shadow-app-accent/20'
                : 'text-app-text/40 hover:text-app-text/80'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Interactive Drone Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode('radar')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              viewMode === 'radar'
                ? 'bg-app-accent text-white shadow-lg shadow-app-accent/20'
                : 'text-app-text/40 hover:text-app-text/80'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Metric Radar Ring
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        
        {/* VIEWPORT: The Dynamic Map Viewer */}
        <div className="xl:col-span-8 flex flex-col justify-center bg-app-bg border border-app-border rounded-[2rem] overflow-hidden min-h-[350px] sm:min-h-[440px] relative">
          
          <AnimatePresence mode="wait">
            {viewMode === 'drone' ? (
              <motion.div 
                key="drone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full relative"
              >
                {/* SVG Vector Drone Map Modeling the Screenshot */}
                <svg 
                  viewBox="0 0 800 550" 
                  className="w-full h-full select-none"
                  style={{ background: 'radial-gradient(circle at 30% 40%, #152438 0%, #030811 100%)' }}
                >
                  <defs>
                    <radialGradient id="rubyGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FF5F1F" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#FF5F1F" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="medicalGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FF2D55" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#FF2D55" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="parkGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#34C759" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#34C759" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="pixarGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00D2C4" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00D2C4" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="diningGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FF9500" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#FF9500" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <style>{`
                    @keyframes path-dash {
                      to { stroke-dashoffset: -40; }
                    }
                    .road-flow-fast {
                      animation: path-dash 2s linear infinite;
                    }
                    .road-flow-slow {
                      animation: path-dash 4s linear infinite;
                    }
                  `}</style>

                  {/* Grid Lines Overlay */}
                  <g opacity="0.12">
                    {Array.from({ length: 11 }).map((_, i) => (
                      <line key={`lh-${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="#ffffff" strokeWidth="0.5" />
                    ))}
                    {Array.from({ length: 17 }).map((_, i) => (
                      <line key={`lv-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="550" stroke="#ffffff" strokeWidth="0.5" />
                    ))}
                  </g>

                  {/* Mosswood Park Green Grass Circle */}
                  <ellipse cx="540" cy="360" rx="90" ry="70" fill="url(#parkGlow)" />
                  
                  {/* Freeway Overpass Structures - Modeling MacArthur Interchange */}
                  {/* Freeway 1 (I-580 / Sweep diagonal across) */}
                  <path d="M-50,290 C250,270 380,330 850,520" fill="none" stroke="#0B1A2D" strokeWidth="24" strokeLinecap="round" />
                  <path d="M-50,290 C250,270 380,330 850,520" fill="none" stroke="#223E5F" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
                  
                  {/* Freeway 2 (State Route 24 vertical connection loop) */}
                  <path d="M300,-50 C380,180 340,320 200,600" fill="none" stroke="#0B1A2D" strokeWidth="24" strokeLinecap="round" />
                  <path d="M300,-50 C380,180 340,320 200,600" fill="none" stroke="#223E5F" strokeWidth="16" strokeLinecap="round" opacity="0.9" />

                  {/* Highway Interchange loops (macarthur maze bridges) */}
                  <path d="M 230,220 Q 300,320 400,310" fill="none" stroke="#0B1A2D" strokeWidth="20" strokeLinecap="round" />
                  <path d="M 230,220 Q 300,320 400,310" fill="none" stroke="#102E4E" strokeWidth="12" strokeLinecap="round" />

                  {/* Flowing Traffic Particles/Neon Trails */}
                  <path d="M-50,290 C250,270 380,330 850,520" fill="none" stroke="#FF5F1F" strokeWidth="2" strokeDasharray="6,24" className="road-flow-fast" opacity="0.65" />
                  <path d="M300,-50 C380,180 340,320 200,600" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4,18" className="road-flow-slow" opacity="0.75" />

                  {/* District / Landmark Glowing Zones */}
                  <circle cx="230" cy="200" r="110" fill="url(#rubyGlow)" opacity={activeLandmark.id === 'ruby' ? 0.9 : 0.4} />
                  <circle cx="180" cy="60" r="80" fill="url(#pixarGlow)" opacity={activeLandmark.id === 'pixar' ? 0.9 : 0.3} />
                  <circle cx="650" cy="90" r="80" fill="url(#rubyGlow)" opacity={activeLandmark.id === 'childrens' ? 0.9 : 0.3} />
                  <circle cx="410" cy="470" r="100" fill="url(#medicalGlow)" opacity={activeLandmark.id === 'altabates' ? 0.9 : 0.3} />
                  <circle cx="720" cy="300" r="80" fill="url(#diningGlow)" opacity={activeLandmark.id === 'dining' ? 0.9 : 0.3} />

                  {/* Linking connection lines from Rent Ruby to landmarks inside map */}
                  {mainLandmarks.map((landmark) => {
                    if (landmark.id === 'ruby') return null;
                    const isActive = activeLandmark.id === landmark.id;
                    return (
                      <line 
                        key={`line-${landmark.id}`}
                        x1="230" 
                        y1="200" 
                        x2={landmark.x} 
                        y2={landmark.y} 
                        stroke={landmark.col} 
                        strokeWidth={isActive ? "2" : "0.5"} 
                        strokeDasharray={isActive ? "none" : "5,5"} 
                        opacity={isActive ? 0.8 : 0.15} 
                        className="transition-all duration-300"
                      />
                    );
                  })}

                  {/* Landmarks Hotspots */}
                  {mainLandmarks.map((lm) => {
                    const isActive = activeLandmark.id === lm.id;
                    const isHovered = hoveredLandmarkId === lm.id;
                    const IconComp = lm.icon;
                    return (
                      <g 
                        key={lm.id}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredLandmarkId(lm.id)}
                        onMouseLeave={() => setHoveredLandmarkId(null)}
                        onClick={() => setActiveLandmark(lm)}
                      >
                        {/* Interactive pulsing concentric ring */}
                        <circle 
                          cx={lm.x} 
                          cy={lm.y} 
                          r={isActive || isHovered ? 40 : 25} 
                          fill="transparent" 
                          stroke={lm.col} 
                          strokeWidth="1.5" 
                          opacity={isActive || isHovered ? 0.8 : 0.2}
                          className="transition-all duration-500" 
                        />
                        
                        {/* Solid colored core badge */}
                        <circle 
                          cx={lm.x} 
                          cy={lm.y} 
                          r={lm.id === 'ruby' ? 22 : 16} 
                          fill={isActive ? lm.col : "#0B1A2D"} 
                          stroke={lm.col} 
                          strokeWidth={lm.id === 'ruby' ? "3" : "2"}
                          className="shadow-2xl transition-all duration-300" 
                        />

                        {/* Centered Node Icon */}
                        <g transform={`translate(${lm.x - (lm.id === 'ruby' ? 10 : 8)}, ${lm.y - (lm.id === 'ruby' ? 10 : 8)})`}>
                          <foreignObject width={lm.id === 'ruby' ? 20 : 16} height={lm.id === 'ruby' ? 20 : 16}>
                            <IconComp 
                              style={{ color: isActive ? '#ffffff' : lm.col }} 
                              className={`${lm.id === 'ruby' ? "w-5 h-5 animate-pulse" : "w-4 h-4"}`} 
                            />
                          </foreignObject>
                        </g>

                        {/* Micro Label Pin Text inside map */}
                        <g transform={`translate(${lm.x}, ${lm.y - (lm.id === 'ruby' ? 32 : 24)})`}>
                          <rect 
                            x="-65" 
                            y="-11" 
                            width="130" 
                            height="20" 
                            rx="10" 
                            fill="#0B1A2D" 
                            stroke={isActive ? lm.col : "#223E5F"} 
                            strokeWidth="1"
                            opacity={isActive || isHovered ? 1 : 0.5}
                            className="transition-all duration-300"
                          />
                          <text 
                            textAnchor="middle" 
                            y="2" 
                            fill={isActive ? "#ffffff" : "#A2B4C7"} 
                            fontSize="8" 
                            fontWeight="900" 
                            fontFamily="monospace"
                            letterSpacing="0.05em"
                          >
                            {lm.id === 'ruby' ? '★ RENT-RUBY' : lm.name.split(' (')[0].toUpperCase()}
                          </text>
                        </g>

                        {/* Interactive mini proximity banner when hovered */}
                        {isHovered && !isActive && (
                          <g transform={`translate(${lm.x}, ${lm.y + 35})`}>
                            <rect x="-80" y="-12" width="160" height="24" rx="6" fill="#15263F" stroke="#FF5F1F" strokeWidth="1" opacity="0.95" />
                            <text textAnchor="middle" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                              {lm.commute} • Click details
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Floating GPS Coordinates & Map Utilities */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 text-[9px] font-mono text-white/50">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                  <span>GPS 37.8286° N, 122.2598° W</span>
                  <span className="text-white/20">|</span>
                  <span className="text-app-accent font-bold">LIVE VECTOR PATHING</span>
                </div>

                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 max-w-[200px] text-[10px] text-white/60 space-y-1">
                  <p className="font-bold text-white uppercase text-[8px] tracking-widest text-app-accent">Highway Flow Indicator</p>
                  <p className="leading-snug">Continuous amber particles represent automated real-time commuting paths down the MacArthur Maze integration.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="radar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full flex items-center justify-center p-8 relative overflow-hidden"
                style={{ background: 'radial-gradient(circle, #0B1A2D 0%, #030811 100%)' }}
              >
                {/* UPGRADED RADIAL RADAR GRID COMPONENT */}
                <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[400px] flex items-center justify-center overflow-hidden border border-white/5 rounded-full bg-black/10">
                  
                  {/* Sweep line sweep effect */}
                  <div 
                    className="absolute inset-0 origin-center opacity-30 pointer-events-none"
                    style={{
                      background: 'conic-gradient(from 0deg, rgba(255,95,31,0.15) 0deg, transparent 90deg, transparent 360deg)',
                      animation: 'sweep 6s linear infinite'
                    }}
                  />

                  {/* Background circles */}
                  {[0.4, 0.8, 1.2].map((radius, i) => (
                    <div
                      key={radius}
                      className="absolute border border-white/10 rounded-full flex items-start justify-center"
                      style={{ 
                        width: `${(radius / 1.4) * 100}%`, 
                        height: `${(radius / 1.4) * 100}%`,
                      }}
                    >
                      <div className="px-2 py-0.5 bg-zinc-950/80 border border-white/10 text-[7px] font-bold text-white/40 uppercase tracking-widest leading-none rounded-sm -translate-y-2">
                        {radius} MI
                      </div>
                    </div>
                  ))}

                  {/* Central Node: Rent-Ruby */}
                  <div className="relative z-20">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-14 h-14 bg-app-accent rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,95,31,0.6)] border-4 border-[#0B1A2D]"
                    >
                      <span className="text-[8px] font-black tracking-widest text-white leading-none text-center">RUBY</span>
                      <span className="text-[7px] font-bold text-white/60 leading-none mt-0.5">HUB</span>
                    </motion.div>
                  </div>

                  {/* Placement of landmarks based on trigonometric math */}
                  {radarLandmarks.map((item, i) => {
                    const x = Math.cos((item.angle * Math.PI) / 180) * (item.dist / 1.4) * 50;
                    const y = Math.sin((item.angle * Math.PI) / 180) * (item.dist / 1.4) * 50;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.name}
                        className="absolute z-10"
                        style={{ 
                          left: `${50 + x}%`, 
                          top: `${50 + y}%` 
                        }}
                      >
                        <div className="relative group cursor-pointer">
                          <motion.div 
                            whileHover={{ scale: 1.15 }}
                            className="p-1.5 bg-[#0B1A2D] border border-white/20 hover:border-app-accent rounded-full text-white shadow-lg transition-all"
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </motion.div>
                          
                          {/* Rich Floating label */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                            <div className="px-2 py-1 bg-white text-[#0B1A2D] rounded-lg text-[9px] font-extrabold whitespace-nowrap shadow-2xl flex items-center gap-1">
                              <span>{item.name}</span>
                              <span className="text-app-accent">•</span>
                              <span>{item.dist}mi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Radar Grid Key Indicator */}
                <div className="absolute bottom-4 right-4 bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-[8px] font-mono text-white/40 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-app-accent rounded-full" />
                    <span>0 - 0.4 MI: Inner Corridor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    <span>0.4 - 0.8 MI: Commute Belt</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* SIDEBAR: Selected Landmark District Dossier */}
        <div className="xl:col-span-4 flex flex-col justify-between border-2 border-app-border bg-app-text/[0.01] rounded-[2rem] p-6 lg:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-app-accent/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-app-accent/10 text-app-accent border border-app-accent/20 rounded-full text-[9px] font-black uppercase tracking-widest font-mono">
                District Dossier
              </span>
              <Bookmark className="w-4 h-4 text-app-text/20" />
            </div>

            {/* Title & Slogan */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-app-text/40 uppercase tracking-widest font-mono block">
                {activeLandmark.tagline}
              </span>
              <h4 className="text-xl font-serif font-black text-app-text leading-tight tracking-tight">
                {activeLandmark.name}
              </h4>
            </div>

            {/* Description */}
            <p className="text-xs text-app-text/70 leading-relaxed">
              {activeLandmark.desc}
            </p>

            {/* Proximity Commute Method */}
            <div className="p-4 bg-app-text/5 border border-app-border rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 bg-app-accent/10 rounded-xl flex items-center justify-center text-app-accent shrink-0">
                <Navigation className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-[8px] font-bold text-app-text/40 uppercase tracking-widest">Commute Advantage</span>
                <span className="block text-xs font-black text-app-text truncate">{activeLandmark.commute}</span>
              </div>
            </div>

            {/* Dynamic bullet items */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[8px] font-black text-app-text/30 uppercase tracking-[0.2em] font-mono block">Key Features</span>
              <div className="grid grid-cols-1 gap-2">
                {activeLandmark.details.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-2.5 text-xs text-app-text/80 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt/Guide */}
          <div className="mt-8 pt-4 border-t border-app-border text-[10px] text-app-text/40 flex items-center gap-2">
            <Info className="w-4 h-4 text-app-accent" />
            <span>Select/Click map markers to query adjacent neighborhoods!</span>
          </div>
        </div>

      </div>

      {/* Styled animation keyframe overrides for radar sweeps */}
      <style>{`
        @keyframes sweep {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
      `}</style>
    </div>
  );
};
