import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  LayoutGrid, 
  List,
  Search,
  Plus,
  Map
} from 'lucide-react';
import { FloorPlanView } from './FloorPlanView';

interface Property {
  id: number;
  name: string;
  address: string;
  neighborhood: string;
  image_url: string;
}

export const PropertyHierarchy = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'floorplan'>('grid');
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        setLoading(false);
      });
  }, []);

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-app-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-black text-app-text">Portfolio <span className="italic">Hierarchy</span></h2>
          <p className="text-app-text/50 mt-2">Managing {properties.length} properties across Oakland & Berkeley.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text/30" />
            <input 
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-app-card border border-app-border rounded-full text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/20 transition-all"
            />
          </div>
          
          <div className="flex p-1 bg-app-text/5 rounded-full border border-app-border">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-app-card shadow-sm text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'list' ? 'bg-app-card shadow-sm text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('floorplan')}
              className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'floorplan' ? 'bg-app-card shadow-sm text-app-accent' : 'text-app-text/40 hover:text-app-text'}`}
              title="Interactive Floor Plan"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>

          <button className="p-3 bg-app-accent text-white rounded-full hover:scale-105 transition-transform shadow-lg">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property, i) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
              onClick={() => {
                setSelectedPropertyId(property.id);
                setViewMode('floorplan');
              }}
            >
              <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-6 relative">
                <img 
                  src={property.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800'} 
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-app-text/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    View Blueprint & Details <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="absolute top-6 right-6 px-4 py-2 bg-app-card/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-app-text shadow-lg">
                  {property.neighborhood}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-app-text group-hover:text-app-accent transition-colors">{property.name}</h3>
                <div className="flex items-center gap-2 text-app-text/40 text-sm">
                  <MapPin className="w-4 h-4" />
                  {property.address}
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-2xl bg-app-card border border-app-border group-hover:border-app-accent/20 transition-colors">
                    <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest mb-1">Units</div>
                    <div className="text-lg font-serif font-bold text-app-text">
                      {property.id === 1 ? '24' : property.id === 2 ? '16' : '12'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-app-card border border-app-border group-hover:border-app-accent/20 transition-colors">
                    <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest mb-1">Occupancy</div>
                    <div className="text-lg font-serif font-bold text-emerald-500">
                      {property.id === 1 ? '91%' : '100%'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-app-card border border-app-border group-hover:border-app-accent/20 transition-colors">
                    <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest mb-1">Revenue</div>
                    <div className="text-lg font-serif font-bold text-app-text">
                      {property.id === 1 ? '$52k' : property.id === 2 ? '$32k' : '$25k'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-app-card rounded-[2.5rem] border border-app-border overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-app-border">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Property</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Neighborhood</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Units</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Occupancy</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Revenue</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr 
                  key={property.id} 
                  className="border-b border-app-border hover:bg-app-text/[0.02] transition-colors group cursor-pointer"
                  onClick={() => {
                    setSelectedPropertyId(property.id);
                    setViewMode('floorplan');
                  }}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-app-text/5">
                        <img src={property.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="font-bold text-app-text">{property.name}</div>
                        <div className="text-xs text-app-text/40">{property.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-app-text/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-app-text/60">
                      {property.neighborhood}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-serif font-bold text-app-text">
                    {property.id === 1 ? '24' : property.id === 2 ? '16' : '12'}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-app-text/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: property.id === 1 ? '91%' : '100%' }}></div>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">
                        {property.id === 1 ? '91%' : '100%'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-serif font-bold text-app-text">
                    {property.id === 1 ? '$52,850' : property.id === 2 ? '$32,100' : '$25,400'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-app-text/20 group-hover:text-app-accent transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Property selector dropdown inside the floorplan mode */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-app-card p-5 rounded-[2rem] border border-app-border shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-app-text/40">Selected Property:</span>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                className="px-4 py-2 bg-app-bg border border-app-border rounded-xl text-xs text-app-text font-sans font-bold focus:outline-none focus:ring-1 focus:ring-app-accent cursor-pointer"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-app-text/40 italic">
            Showing active physical units & structure for {properties.find(p => p.id === selectedPropertyId)?.name || 'Property'}
          </p>
        </div>
        
        <FloorPlanView propertyId={selectedPropertyId} />
      </div>
    )}
    </div>
  );
};
