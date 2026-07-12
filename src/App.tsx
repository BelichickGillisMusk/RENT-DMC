import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import oaklandMapBg from './assets/images/oakland_macarthur_3d_map_1781415061100.jpg';
// @ts-ignore
import rubySensationBg from './assets/images/ruby_sensation_bg_1782953736765.jpg';
import { 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  MessageSquare,
  CreditCard,
  ChevronRight,
  Sparkles,
  MapPin,
  Package,
  Wind,
  Coffee,
  Train,
  Hospital,
  TreePine,
  Bike,
  Camera,
  History,
  Music,
  Info,
  Menu,
  X,
  Share2,
  DollarSign,
  Activity,
  FileText,
  Mail,
  Wrench,
  Phone,
  ArrowDownCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { ShimmerBackground, ShimmerEffect } from './components/VisualEffects';
import { AIPropertyVisualizer } from './components/AIImageGenerator';
import { RentRollDashboard } from './components/RentRollDashboard';
import { MaintenanceModule } from './components/MaintenanceModule';
import { FeatureSummarySheet } from './components/FeatureSummarySheet';
import { PropertyHierarchy } from './components/PropertyHierarchy';
import { TenantPortal } from './components/TenantPortal';
import { NightlifeAttractions } from './components/NightlifeAttractions';
import { NeighborhoodRadiusMap } from './components/NeighborhoodRadiusMap';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './components/ThemeContext';

import { CEOBriefingPortal } from './components/CEOBriefingPortal';
import { AdminLegalLog } from './components/AdminLegalLog';
import { SFPlusModule } from './components/SFPlusModule';
import { MarketMaxModule } from './components/MarketMaxModule';
import { TenantConcernsModule } from './components/TenantConcernsModule';
import { VendorManagement } from './components/VendorManagement';
import { ProductTour } from './components/ProductTour';
import { MaintenanceFlow } from './components/MaintenanceFlow';
import { OwnerPresentation } from './components/OwnerPresentation';
import { TravelingNurseHero } from './components/TravelingNurseHero';
import { TravelNursePortal } from './components/TravelNursePortal';
import { SecurityCameras } from './components/SecurityCameras';
import { MosswoodMailboxes } from './components/MosswoodMailboxes';
import { AILaurenWidget } from './components/AILaurenWidget';
import { GmailContactForm } from './components/GmailContactForm';
import { ShareModal } from './components/ShareModal';
import { EmailTemplates } from './components/EmailTemplates';
import { EmployersSection } from './components/EmployersSection';
import { AdminOccupancyMonitor } from './components/AdminOccupancyMonitor';
import { VisibilityMatrix } from './components/VisibilityMatrix';
import { AdminNotificationSettings } from './components/AdminNotificationSettings';

const revenueData = [
  { month: 'Jan', revenue: 45000, occupancy: 92 },
  { month: 'Feb', revenue: 52000, occupancy: 94 },
  { month: 'Mar', revenue: 48000, occupancy: 93 },
  { month: 'Apr', revenue: 61000, occupancy: 96 },
  { month: 'May', revenue: 59000, occupancy: 95 },
  { month: 'Jun', revenue: 72000, occupancy: 98 },
];

const distributionData = [
  { name: 'Residential', value: 65, color: '#A64B4B' },
  { name: 'Commercial', value: 25, color: '#7A3333' },
  { name: 'Short-term', value: 10, color: '#D18E8E' },
];

export default function App() {
  const { theme, activePalette } = useTheme();
  const [view, setView] = useState<'hub' | 'admin' | 'tenant' | 'travel'>('hub');
  const [adminTab, setAdminTab] = useState<'portfolio' | 'rent-roll' | 'maintenance' | 'marketing' | 'community' | 'ceo' | 'sfplus' | 'marketmax' | 'vendors' | 'concerns' | 'flow' | 'travel' | 'cameras' | 'legal' | 'email-templates'>('portfolio');
  const [rentRollUnlocked, setRentRollUnlocked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOwnerVision, setShowOwnerVision] = useState(false);
  const [showEmailContact, setShowEmailContact] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className={`min-h-screen font-sans selection:bg-app-accent/30 transition-colors duration-700`}>
      {view === 'admin' && <ShimmerBackground />}
      
      <AnimatePresence>
        {showOwnerVision && (
          <OwnerPresentation 
            onClose={() => setShowOwnerVision(false)} 
            onNavigate={(tab) => {
              setView('admin');
              setAdminTab(tab as any);
              if (tab === 'rent-roll') setRentRollUnlocked(true);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEmailContact && (
          <GmailContactForm onClose={() => setShowEmailContact(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showShareModal && (
          <ShareModal onClose={() => setShowShareModal(false)} />
        )}
      </AnimatePresence>

      {/* Floating global status indicator */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in">
        <div className="bg-[#0B1A2D]/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.25em] shadow-[0_8px_30px_rgba(166,75,75,0.4)] flex items-center gap-2 pointer-events-auto select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ruby opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ruby"></span>
          </span>
          Only 2 Units Left
        </div>
      </div>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 border-b border-app-border bg-app-bg/80 backdrop-blur-xl transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between text-app-text">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-black tracking-tighter text-2xl">
              <span className="text-app-text">RENT-</span>
              <span className="text-app-accent">RUBY</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {view === 'hub' ? (
              <>
                <a href="#neighborhood" className="text-app-text/60 hover:text-app-text transition-colors">Neighborhood</a>
                <a href="#mosswood-mailboxes" className="text-app-text/60 hover:text-app-text transition-colors">Mosswood Park</a>
                <a href="#maintenance-flow" className="text-app-text/60 hover:text-app-text transition-colors">Maintenance</a>
                <a href="#applications" className="text-app-text/60 hover:text-app-text transition-colors">Applications</a>
                <a href="#digital-lease" className="text-app-text/60 hover:text-app-text transition-colors">Digital Lease</a>
              </>
            ) : view === 'admin' ? (
              <>
                <button onClick={() => setAdminTab('portfolio')} className="text-app-text/60 hover:text-app-text transition-colors">Portfolio</button>
                <button onClick={() => { setRentRollUnlocked(true); setAdminTab('rent-roll'); }} className="text-app-text/60 hover:text-app-text transition-colors">Rent Roll</button>
                <button onClick={() => setAdminTab('legal')} className="text-app-text/60 hover:text-app-text transition-colors">Legal & Compliance</button>
                <button onClick={() => setAdminTab('ceo')} className="text-app-text/60 hover:text-app-text transition-colors">CEO Briefing</button>
              </>
            ) : (
              <>
                <a href="#" className="text-app-text/60 hover:text-app-text transition-colors">Portal</a>
                <a href="#" className="text-app-text/60 hover:text-app-text transition-colors">Maintenance</a>
                <a href="#" className="text-app-text/60 hover:text-app-text transition-colors">Payments</a>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 text-white/80 hover:text-app-accent transition-colors cursor-pointer flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
              title="Share Rent-Ruby"
            >
              <Share2 className="w-4 h-4 text-app-accent" />
            </button>
            <ThemeToggle />
            {view === 'admin' && (
              <button 
                onClick={() => setShowOwnerVision(true)}
                className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-app-accent/10 border border-app-accent/20 text-app-accent text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-app-accent hover:text-white transition-all"
              >
                <ShieldCheck className="w-3 h-3" /> Vision Deck
              </button>
            )}

            <button className={`md:hidden p-2 ${view === 'hub' ? 'text-app-text' : 'text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 pt-24 px-6 ${view === 'hub' ? 'bg-app-bg text-app-text' : 'bg-zinc-950 text-white'} md:hidden`}
          >
            <div className="flex flex-col gap-8 text-2xl font-serif font-bold">
              {view === 'hub' ? (
                <>
                <a href="#neighborhood" onClick={() => setIsMenuOpen(false)}>Neighborhood</a>
                <a href="#mosswood-mailboxes" onClick={() => setIsMenuOpen(false)}>Mosswood Park</a>
                <a href="#maintenance-flow" onClick={() => setIsMenuOpen(false)}>Maintenance</a>
                <a href="#applications" onClick={() => setIsMenuOpen(false)}>Applications</a>
                <a href="#digital-lease" onClick={() => setIsMenuOpen(false)}>Digital Lease</a>
                </>
              ) : view === 'admin' ? (
                <>
                  <button onClick={() => { setAdminTab('portfolio'); setIsMenuOpen(false); }} className="text-left py-2">Portfolio</button>
                  <button onClick={() => { setRentRollUnlocked(true); setAdminTab('rent-roll'); setIsMenuOpen(false); }} className="text-left py-2">Rent Roll</button>
                  <button onClick={() => { setAdminTab('legal'); setIsMenuOpen(false); }} className="text-left py-2">Legal & Forms</button>
                  <button onClick={() => { setAdminTab('ceo'); setIsMenuOpen(false); }} className="text-left py-2">CEO Briefing</button>
                </>
              ) : (
                <>
                  <a href="#" onClick={() => setIsMenuOpen(false)}>Portal</a>
                  <a href="#" onClick={() => setIsMenuOpen(false)}>Maintenance</a>
                  <a href="#" onClick={() => setIsMenuOpen(false)}>Payments</a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'travel' ? (
          <motion.div
            key="travel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TravelNursePortal onBack={() => setView('hub')} />
          </motion.div>
        ) : view === 'hub' ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-20"
          >
            {/* Hero Section */}
            <div className="relative min-h-[90vh] py-32 flex items-center justify-center overflow-hidden bg-zinc-950">
              <div className="absolute inset-0 z-0 bg-app-bg">
                <img 
                  src={activePalette === 'ruby-sensation' ? rubySensationBg : oaklandMapBg} 
                  alt="Ruby Sensation Vector Design Background" 
                  className="w-full h-full object-cover opacity-60 blur-[0.5px] bg-app-bg"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-app-bg via-app-bg/60 to-app-bg/20"></div>
              </div>
              
              <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 text-center space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-app-card/75 border border-app-border rounded-full text-app-accent text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl shadow-lg"
                >
                  <Sparkles className="w-3.5 h-3.5 text-app-accent" /> Positive Vibes Live Here Story.
                </motion.div>
                
                <div className="space-y-6">
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-[7rem] font-sans font-black text-app-text tracking-tight leading-[0.9] uppercase flex flex-col items-center"
                  >
                    <span className="italic text-app-accent mb-4 tracking-tighter">Hike, Walk, Bike, Rail-</span>
                    <span className="text-4xl md:text-[5rem] text-app-text/90">Mosswood, Oakland</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-2xl font-bold text-app-text/80 max-w-3xl mx-auto"
                  >
                    Your safe, vibrant anchor connecting you to the best of East Bay's outdoors and city life.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-wrap justify-center gap-3 md:gap-4 pt-4 pb-2"
                >
                  {['GM On Site', 'Maint On Site', 'Free Street Parking', 'Bike Room Inside', 'Ultimate Location in Mosswood/Temescal area.'].map((amenity, i) => (
                    <span key={i} className="px-5 py-2.5 bg-app-accent text-white font-black uppercase text-xs md:text-sm tracking-widest rounded-full shadow-[0_0_20px_rgba(255,95,31,0.6)] border border-white/20">
                      {amenity}
                    </span>
                  ))}
                </motion.div>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[29px] text-white/60 font-bold max-w-2xl mx-auto leading-relaxed border-t border-white/10 pt-8"
                >
                  3875 Ruby Street. A 100-year anchor in Oakland's medical and transit district, refined for modern living.
                </motion.p>

                <div className="flex flex-col gap-12 pt-8 border-t border-white/10 mt-8 w-full text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full"
                  >
                    <NeighborhoodRadiusMap />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col md:flex-row justify-between items-center bg-app-card border-2 border-app-border rounded-[2.5rem] p-8 md:p-10 gap-8 w-full"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                      <button className="w-full sm:w-auto px-10 py-5 bg-app-accent text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,95,31,0.3)] flex items-center justify-center gap-3">
                        Schedule a Tour
                      </button>
                      <button className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20">
                        View Availability
                      </button>
                    </div>
                    
                    <div className="flex gap-8 sm:gap-16 w-full md:w-auto justify-center md:justify-end">
                       <div className="flex flex-col items-center md:items-start gap-1">
                          <div className="text-4xl font-sans font-black text-white leading-none">96</div>
                          <div className="text-[9px] font-black tracking-widest text-[#FF5F1F] uppercase font-mono mt-1">Walk Score®</div>
                       </div>
                       <div className="flex flex-col items-center md:items-start gap-1">
                          <div className="text-4xl font-sans font-black text-white leading-none">88</div>
                          <div className="text-[9px] font-black tracking-widest text-[#FF5F1F] uppercase font-mono mt-1">Transit Score®</div>
                       </div>
                       <div className="flex flex-col items-center md:items-start gap-1">
                          <div className="text-4xl font-sans font-black text-white leading-none">99</div>
                          <div className="text-[9px] font-black tracking-widest text-[#FF5F1F] uppercase font-mono mt-1">Bike Score®</div>
                       </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Essential Convenience */}
            <section id="essentials" className="py-32 px-6 max-w-7xl mx-auto">
              <div className="text-center mb-20 space-y-4">
                <h2 className="text-6xl font-serif font-black tracking-tighter">Essential <span className="italic text-app-accent underline decoration-app-accent/30 underline-offset-12">Convenience</span>.</h2>
                <p className="text-app-text/70 max-w-xl mx-auto text-lg font-medium">The modern necessities you rely on.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: 'Free Street Parking', desc: 'Permits are completely free for residents through an exclusive hospital agreement.', icon: Zap },
                  { title: 'On-Site Laundry', desc: 'Modern, high-capacity machines just steps from your door.', icon: Zap },
                  { title: 'Amazon Locker (On-Site)', desc: 'Secure, dedicated package lockers located directly on property for fast, safe deliveries.', icon: Package },
                  { title: 'Secure Bike Room', desc: 'Indoor storage with key-card access to keep your bike safe.', icon: Bike },
                  { title: '24/7 Monitoring', desc: 'AI-powered recognition cameras throughout the perimeter.', icon: Camera },
                  { title: 'On-Site Maintenance', desc: 'Experienced specialists ready to handle repairs promptly.', icon: Wrench },
                ].map((item, i) => (
                  <div key={item.title} className="p-12 rounded-[3rem] bg-app-card border-2 border-app-border hover:border-app-accent/30 transition-all group shadow-sm hover:shadow-2xl hover:-translate-y-2 duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-app-accent/10 flex items-center justify-center mb-10 group-hover:bg-app-accent/20 transition-colors">
                      <item.icon className="w-8 h-8 text-app-accent group-hover:text-app-accent transition-colors" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold mb-4 tracking-tight">{item.title}</h3>
                    <p className="text-app-text/70 leading-relaxed text-lg font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Employers Section */}
            <EmployersSection />

            <section id="maintenance-flow" className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <MaintenanceFlow />
              </div>
            </section>
            
            <section id="travel-nurses" className="py-24 bg-slate-50 border-y border-slate-200/60">
              <div className="max-w-7xl mx-auto px-6">
                <TravelNursePortal onBack={() => {}} />
              </div>
            </section>

            {/* New Simple Mosswood Park Design */}
            <MosswoodMailboxes />

            {/* Neighborhood Mosaic Section - Commented out for now as per user request to make ideas/suggestions available as they edit */}
            {/*
            <section id="neighborhood-mosaic" className="py-32 bg-app-bg overflow-hidden">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div className="space-y-6 max-w-2xl">
                    <div className="text-xs font-bold text-app-accent uppercase tracking-[0.3em]">The Ruby Mosaic</div>
                    <h2 className="text-6xl font-serif font-black leading-tight">
                      Where <span className="italic text-app-accent">Oakland</span> Converges.
                    </h2>
                    <p className="text-xl text-app-text/80 leading-relaxed font-light">
                      A curated collection of life at 3875 Ruby. From the essential care of Kaiser to the high-speed pulse of MacArthur BART, everything is within your orbit.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <div className="text-4xl font-serif font-bold text-app-text">94</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-app-text/50">Walk Score</div>
                    </div>
                    <div className="w-px h-12 bg-app-border" />
                    <div className="text-right">
                      <div className="text-4xl font-serif font-bold text-app-text">88</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-app-text/50">Transit Score</div>
                    </div>
                  </div>
                </div>

                {/* The Mosaic Grid *\/}
                <div className="grid grid-cols-12 grid-rows-6 gap-4 h-[1200px] md:h-[900px]">
                  {/* Living Space - Large Anchor *\/}
                  <div className="col-span-12 md:col-span-6 row-span-4 group relative overflow-hidden rounded-[3rem] shadow-2xl bg-app-accent/5">
                    <img 
                      src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200" 
                      alt="Modern Ruby Living Space" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-app-text/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-app-accent uppercase tracking-widest">The Sanctuary</div>
                        <div className="text-3xl font-serif font-bold italic text-white">Refined Living Inside Ruby</div>
                      </div>
                    </div>
                  </div>

                  {/* Unit Interior - Detail *\/}
                  <div className="col-span-6 md:col-span-3 row-span-3 group relative overflow-hidden rounded-[2.5rem] shadow-xl bg-app-card">
                    <img 
                      src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop" 
                      alt="Modern Unit Interior" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-app-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="text-white font-serif italic text-xl">Modern Soul</div>
                    </div>
                  </div>

                  {/* Master Bedroom *\/}
                  <div className="col-span-6 md:col-span-3 row-span-2 group relative overflow-hidden rounded-[2.5rem] shadow-lg bg-zinc-900 border border-white/5 flex items-center justify-center p-8">
                     <div className="text-center space-y-2">
                        <Hospital className="w-10 h-10 text-app-accent mx-auto mb-4" />
                        <div className="text-[10px] font-black text-app-accent uppercase tracking-widest">Medical Hub Access</div>
                        <div className="text-lg font-bold text-white uppercase tracking-tighter">Steps from Kaiser</div>
                     </div>
                  </div>

                  {/* Transit Access Styled Card *\/}
                  <div className="col-span-6 md:col-span-3 row-span-2 group relative overflow-hidden rounded-[2.5rem] shadow-lg bg-app-accent p-8 flex flex-col justify-between">
                    <Train className="w-8 h-8 text-white" />
                    <div>
                      <div className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 font-mono">BART Proximity</div>
                      <div className="text-xl font-bold text-white uppercase tracking-tighter leading-tight">MacArthur Transit Heart</div>
                    </div>
                  </div>

                  {/* Kitchen Interior *\/}
                  <div className="col-span-12 md:col-span-6 row-span-2 group relative overflow-hidden rounded-[3rem] shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop" 
                      alt="Modern Ruby Kitchen" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-ruby/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="text-white font-serif italic text-3xl">Gourmet Details</div>
                    </div>
                  </div>

                  {/* Dining Area *\/}
                  <div className="col-span-6 md:col-span-3 row-span-2 group relative overflow-hidden rounded-[2.5rem] shadow-lg bg-zinc-900 border border-white/5 flex items-center justify-center p-8">
                    <div className="text-center">
                      <TreePine className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Parkside Living</div>
                      <div className="text-lg font-bold text-white uppercase tracking-tighter">Mosswood Adjacent</div>
                    </div>
                  </div>

                  {/* Bathroom / Detail *\/}
                  <div className="col-span-6 md:col-span-3 row-span-2 group relative overflow-hidden rounded-[2.5rem] shadow-lg bg-app-card">
                    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center border border-white/5">
                      <Coffee className="w-10 h-10 text-app-accent mb-4" />
                      <div className="text-[10px] font-bold text-app-accent uppercase tracking-widest mb-1 italic">Vibrant Culture</div>
                      <div className="text-lg font-bold text-app-text tracking-tighter uppercase line-clamp-2">Piedmont & Temescal Soul</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            */}

            <footer className="py-24 px-6 border-t border-app-border bg-app-bg">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
                <div className="col-span-2 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-app-accent" />
                    <span className="text-3xl font-black tracking-tighter text-app-text uppercase">3875 RUBY</span>
                  </div>
                  <p className="text-app-text/80 max-w-sm leading-relaxed font-medium">
                    A boutique residential community in the heart of Oakland. Managed with soul, powered by intelligence.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="text-xs font-black uppercase tracking-widest text-app-text/50">Navigation</div>
                  <ul className="space-y-4 text-sm font-bold">
                    <li><a href="tel:4159008563" className="text-app-text/70 hover:text-app-accent transition-colors">Call 415-900-8563</a></li>
                    <li><button onClick={() => setShowEmailContact(true)} className="text-app-text/70 hover:text-app-accent transition-colors">Email hello@rent-ruby.com</button></li>
                    <li><a href="#" className="text-app-text/70 hover:text-app-accent transition-colors">Maintenance Request</a></li>
                  </ul>
                </div>
                <div className="space-y-6">
                  <div className="text-xs font-black uppercase tracking-widest text-app-text/50">Contact</div>
                  <ul className="space-y-4 text-sm font-bold">
                    <li className="text-app-text/70">
                      <span className="block text-[#FF5F1F] text-[9px] font-black uppercase tracking-widest mb-0.5">Lauren (AI Assistant)</span>
                      hello@rent-ruby.com
                      <span className="block text-white/30 text-[9px] lowercase font-normal tracking-wide mt-0.5">(Forwarded/CC to bryan@norcalcarbmobile.com)</span>
                    </li>
                    <li className="text-app-text/70">415-900-8563</li>
                    <li className="text-app-text/70">Oakland, CA 94609</li>
                  </ul>
                </div>
              </div>
              <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-app-border flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-[11px] font-bold text-app-text/60 uppercase tracking-[0.3em] font-mono text-center md:text-left">
                  © 2026 RENT-RUBY.COM. <span className="text-app-accent">OAKLAND SOUL.</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-[10px] font-black text-app-accent uppercase tracking-widest">Powered by</div>
                  <div className="text-2xl font-black tracking-tighter text-app-text uppercase">RENT-RUBY.COM</div>
                </div>
                <div className="flex gap-10 text-[11px] font-bold uppercase tracking-widest text-app-text/60">
                  <a href="#" className="hover:text-app-accent transition-colors border-b border-transparent hover:border-app-accent pb-1">Privacy</a>
                  <a href="#" className="hover:text-app-accent transition-colors border-b border-transparent hover:border-app-accent pb-1">Terms</a>
                  <button onClick={() => {
                     const pwd = prompt("Admin Password:");
                     if (pwd === "1111") {
                       setView('admin');
                       window.scrollTo(0, 0);
                     } else if (pwd !== null) {
                       alert("Incorrect password");
                     }
                  }} className="hover:text-app-accent transition-colors border-b border-transparent hover:border-app-accent pb-1 uppercase">Admin Login</button>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : view === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-app-bg pt-32 pb-20 px-6"
          >
            <div className="max-w-7xl mx-auto">
              {/* Portal Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                  <h2 className="text-4xl font-serif font-black text-app-text">Property Admin Portal</h2>
                  <p className="text-app-text/50 mt-2">Secure management for 3875 Ruby Street.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-end mr-4 border-r border-app-border pr-6">
                    <div className="text-[10px] font-bold text-app-accent uppercase tracking-widest">Emergency 24/7</div>
                    <div className="text-lg font-black text-app-text">(510) 555-9111</div>
                  </div>
                  <button 
                    onDoubleClick={() => {
                      setRentRollUnlocked(true);
                      setAdminTab('rent-roll');
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-sm ${
                      rentRollUnlocked ? 'bg-ruby text-white' : 'bg-app-card border border-app-border text-app-text/40'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" /> {rentRollUnlocked ? 'Executive Rent Roll' : 'Double Click for Rent Roll'}
                  </button>
                  <button 
                    onClick={() => {
                      const url = window.location.href;
                      navigator.clipboard.writeText(url);
                      alert('Link copied! Ready to share with your team.');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-app-card border border-app-border rounded-full font-bold text-sm hover:bg-app-text hover:text-app-bg transition-all shadow-sm"
                  >
                    <Share2 className="w-4 h-4" /> Share Hub
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Total Revenue', value: '$42,850', trend: '+12.5%', icon: DollarSign, color: 'text-ruby', bg: 'bg-ruby/5', tab: 'sfplus' },
                  { label: 'Portfolio Occupancy', value: '23 / 24', trend: '95.8%', icon: Users, color: 'text-ruby', bg: 'bg-ruby/5', tab: 'rent-roll' },
                  { label: '24 Unit Compliance', value: '100%', trend: 'All files', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/5', tab: 'legal' },
                  { label: 'Maintenance Tasks', value: '4', trend: '-2', icon: Activity, color: 'text-ruby-light', bg: 'bg-ruby-light/5', tab: 'maintenance' },
                ].map((stat) => (
                  <div 
                    key={stat.label} 
                    onClick={() => {
                      if (stat.tab === 'rent-roll' && !rentRollUnlocked) {
                        alert('Double click the "Double Click for Rent Roll" button in the header to access this sensitive data.');
                        return;
                      }
                      setAdminTab(stat.tab as any);
                    }}
                    className={`p-6 rounded-[2rem] bg-app-card border-2 border-app-border shadow-lg hover:border-app-accent/20 transition-all group cursor-pointer`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                      </div>
                      <span className="text-[10px] font-bold text-ruby bg-ruby/5 px-3 py-1 rounded-full border border-ruby/10 whitespace-nowrap">{stat.trend}</span>
                    </div>
                    <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-[0.2em]">{stat.label}</div>
                    <div className="text-3xl font-serif font-black mt-2 text-app-text">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Quick Guide / What's New */}
              <div className="mb-12 p-8 rounded-[2.5rem] bg-app-text text-app-bg shadow-2xl flex flex-col md:flex-row gap-8 items-center border border-[#2d0b13] font-bold underline">
                <div className="flex-grow space-y-4">
                  <h3 className="text-2xl font-serif font-bold italic">Operational Intelligence Hub</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm text-app-bg/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-app-accent" />
                      <span>Monitor real-time revenue & occupancy trends</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-app-bg/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-app-accent" />
                      <span>Track AI-powered security & sublease alerts</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-app-bg/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-app-accent" />
                      <span>Manage maintenance & community schedules</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-app-bg/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-app-accent" />
                      <span>Access CEO Briefing & Legal Notice tools</span>
                    </div>
                  </div>
                </div>
                <div className="w-px h-16 bg-app-bg/10 hidden md:block" />
                <div className="text-center md:text-left">
                  <div className="text-[10px] font-bold text-app-accent uppercase tracking-[0.3em] mb-1">System Status</div>
                  <div className="text-xl font-serif font-bold italic">All Systems Nominal</div>
                </div>
              </div>

              {/* Main Portal Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-serif font-bold text-app-text">Revenue Intelligence</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-app-accent"></div>
                      <div className="w-3 h-3 rounded-full bg-ruby"></div>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C14931" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#C14931" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#C14931" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm">
                  <h3 className="text-2xl font-serif font-bold mb-8">Recent Activity</h3>
                  <div className="space-y-6">
                    {[
                      { user: 'Unit 4B', action: 'Rent Payment Received', time: '2 hours ago', icon: DollarSign, color: 'bg-ruby/10 text-ruby' },
                      { user: 'Unit 2A', action: 'Maintenance Request: Sink', time: '5 hours ago', icon: Activity, color: 'bg-ruby-light/10 text-ruby-light' },
                      { user: 'System', action: 'New Lease Generated: 3C', time: '1 day ago', icon: FileText, color: 'bg-ruby/10 text-ruby' },
                      { user: 'Unit 1A', action: 'Package Delivered to Hub', time: '1 day ago', icon: Package, color: 'bg-purple-50 text-purple-600' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-app-text/5 transition-colors cursor-pointer group">
                        <div className={`w-12 h-12 rounded-xl ${activity.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <activity.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-grow">
                          <div className="font-bold text-app-text">{activity.user}</div>
                          <div className="text-sm text-app-text/50">{activity.action}</div>
                        </div>
                        <div className="text-xs font-bold text-app-text/30 uppercase tracking-widest">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Occupancy and Visibility Controls */}
              <div className="grid grid-cols-1 gap-8 mb-12">
                <AdminOccupancyMonitor />
                <VisibilityMatrix />
                <AdminNotificationSettings />
              </div>

              {/* Portal Navigation Tabs */}
              <div className="flex gap-8 border-b border-app-text/5 mb-12 overflow-x-auto pb-px">
                <button 
                  onClick={() => setAdminTab('portfolio')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'portfolio' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  Portfolio
                  {adminTab === 'portfolio' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => {
                    if (rentRollUnlocked) {
                      setAdminTab('rent-roll');
                    } else {
                      alert('Double click the "Double Click for Rent Roll" button in the header to access this sensitive data.');
                    }
                  }}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'rent-roll' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'} ${!rentRollUnlocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  Rent Roll
                  {adminTab === 'rent-roll' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('maintenance')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'maintenance' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  Maintenance
                  {adminTab === 'maintenance' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('ceo')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'ceo' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  CEO Briefing
                  {adminTab === 'ceo' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('legal' as any)}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === ('legal' as any) ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  Legal Log
                  {adminTab === ('legal' as any) && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('sfplus')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'sfplus' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  SF Plus
                  {adminTab === 'sfplus' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('marketmax')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'marketmax' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  Market Max
                  {adminTab === 'marketmax' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('concerns')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'concerns' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  Tenant Concerns
                  {adminTab === 'concerns' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('vendors')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'vendors' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  Vendors
                  {adminTab === 'vendors' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('flow')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'flow' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  Maintenance Flow
                  {adminTab === 'flow' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('travel')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'travel' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  Nurse Portal
                  {adminTab === 'travel' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('cameras')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'cameras' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  Security Cameras
                  {adminTab === 'cameras' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
                <button 
                  onClick={() => setAdminTab('email-templates')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${adminTab === 'email-templates' ? 'text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
                >
                  Email Templates
                  {adminTab === 'email-templates' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-app-accent" />}
                </button>
              </div>

              {/* Dynamic Admin Content */}
              {adminTab === 'portfolio' ? (
                <section id="portfolio" className="py-12">
                  <PropertyHierarchy />
                </section>
              ) : adminTab === 'rent-roll' ? (
                <section id="rent-roll" className="py-12">
                  <div className="mb-12 space-y-4">
                    <h2 className="text-4xl font-bold text-app-text font-serif">Your <span className="italic">Intelligent</span> Rent Roll.</h2>
                    <p className="text-app-text/50 max-w-xl font-medium">Real-time management of your property portfolio with integrated financial tracking.</p>
                  </div>
                  <RentRollDashboard />
                </section>
              ) : adminTab === 'maintenance' ? (
                <section id="maintenance" className="py-12">
                  <MaintenanceModule />
                </section>
              ) : adminTab === 'ceo' ? (
                <section id="ceo" className="py-12">
                  <CEOBriefingPortal />
                </section>
              ) : adminTab === 'legal' ? (
                <section id="legal" className="py-12">
                  <AdminLegalLog />
                </section>
              ) : adminTab === 'sfplus' ? (
                <section id="sfplus" className="py-12">
                  <SFPlusModule />
                </section>
              ) : adminTab === 'marketmax' ? (
                <section id="marketmax" className="py-12">
                  <MarketMaxModule />
                </section>
              ) : adminTab === 'concerns' ? (
                <section id="concerns" className="py-12">
                  <TenantConcernsModule />
                </section>
              ) : adminTab === 'flow' ? (
                <section id="flow" className="py-12">
                  <MaintenanceFlow />
                </section>
              ) : adminTab === 'travel' ? (
                <section id="travel-nurse" className="py-12">
                  <TravelNursePortal onBack={() => setAdminTab('portfolio')} />
                </section>
              ) : adminTab === 'cameras' ? (
                <section id="cameras" className="py-12">
                  <SecurityCameras />
                </section>
              ) : adminTab === 'email-templates' ? (
                <section id="email-templates" className="py-12">
                  <EmailTemplates />
                </section>
              ) : (
                <section id="vendors" className="py-12">
                  <VendorManagement />
                </section>
              )}

              {/* AI Section */}
              <section id="ai">
                <AIPropertyVisualizer />
              </section>

              {/* Summary Sheet */}
              <section id="summary-sheet">
                <FeatureSummarySheet />
              </section>

              {/* Ruby Eco System / Product Tour moved to Admin */}
              <ProductTour />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tenant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-app-bg pt-32 pb-20 px-6"
          >
            <div className="max-w-7xl mx-auto">
              <div className="mb-12">
                <h2 className="text-4xl font-serif font-black text-app-text">Ruby <span className="italic">Resident</span> Portal</h2>
                <p className="text-app-text/50 mt-2">Welcome home, Jordan. Your community at your fingertips.</p>
              </div>
              <TenantPortal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-12 border-t border-app-text/5 bg-[#e7eaef]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ruby flex items-center justify-center text-white font-black text-xs">R</div>
            <span className="text-sm font-black text-[#060300] border-[#110a01] uppercase tracking-widest">Rent-Ruby.com</span>
          </div>
          <div className="flex gap-10 items-center">
            <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-[0.2em] hidden sm:block">
              © 2026 Rent-Ruby.com • All Rights Reserved
            </div>
            {/* View Toggle */}
            <div className={`flex p-1 rounded-full bg-app-text/10 border border-app-border`}>
              <button 
                onClick={() => setView('hub')}
                className={`px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
                  view === 'hub' 
                  ? 'bg-app-accent text-white shadow-lg' 
                  : 'text-app-text/60 hover:text-app-text'
                }`}
              >
                Hub
              </button>
              <button 
                onClick={() => setView('admin')}
                className={`px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 bg-black text-[#f8f5f8] ${
                  view === 'admin' 
                  ? 'shadow-lg ring-2 ring-app-accent' 
                  : 'opacity-80 hover:opacity-100'
                }`}
              >
                Admin
              </button>
              <button 
                onClick={() => setView('tenant')}
                className={`px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 bg-black text-[#f8f5f8] ${
                  view === 'tenant' 
                  ? 'shadow-lg ring-2 ring-app-accent' 
                  : 'opacity-80 hover:opacity-100'
                }`}
              >
                Tenant
              </button>
            </div>
          </div>
        </div>
      </footer>
      <AILaurenWidget />
    </div>
  );
}
