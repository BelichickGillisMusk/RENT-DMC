import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Plus, Edit2, Trash2, CheckCircle2, Tag } from 'lucide-react';

type Category = 'Move-In' | 'Maintenance' | 'Rent' | 'Other';

interface Template {
  id: number;
  title: string;
  category: Category;
  subject: string;
  body: string;
}

export function EmailTemplates() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      title: 'Welcome Packet',
      category: 'Move-In',
      subject: 'Welcome to 3875 Ruby Street! Here are your digital keys.',
      body: `Hi {{tenant_name}},\n\nWelcome to your new home in Oakland! Included is your digital move-in packet outlining portal access, maintenance protocols, and smart lock details.\n\nCheers,\nRuby Management`
    },
    {
      id: 2,
      title: 'Rent Reminder',
      category: 'Rent',
      subject: 'Friendly reminder: Rent is due soon',
      body: `Hi {{tenant_name}},\n\nThis is an automated reminder that rent for unit {{unit_number}} is due on the 1st of the month. You can easily make a payment via the Tenant Portal.\n\nThank you!`
    },
    {
      id: 3,
      title: 'Maintenance Update',
      category: 'Maintenance',
      subject: 'Update on your recent maintenance request',
      body: `Hi {{tenant_name}},\n\nOur team is reviewing your request regarding {{issue_type}}. We expect to have someone on-site to address it by {{scheduled_time}}.\n\nBest,\nMaintenance Team`
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; category: Category; subject: string; body: string }>({
    title: '',
    category: 'Other',
    subject: '',
    body: ''
  });

  const categories: ('All' | Category)[] = ['All', 'Move-In', 'Maintenance', 'Rent', 'Other'];

  const handleEdit = (t: Template) => {
    setEditingId(t.id);
    setEditForm({ title: t.title, category: t.category, subject: t.subject, body: t.body });
  };

  const handleSave = () => {
    if (editingId === 0) {
      // Create new
      setTemplates([...templates, { id: Date.now(), ...editForm }]);
    } else {
      // Update
      setTemplates(templates.map(t => t.id === editingId ? { ...t, ...editForm } : t));
    }
    setEditingId(null);
  };

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const getCategoryBadgeColor = (cat: Category) => {
    switch (cat) {
      case 'Move-In': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Maintenance': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Rent': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      default: return 'bg-app-text/10 text-app-text/70 border-app-border';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-serif font-black text-app-text">Email Templates</h2>
          <p className="text-app-text/50 font-medium">Standardize and speed up communication using Gmail templates.</p>
        </div>
        <button 
          onClick={() => { setEditingId(0); setEditForm({ title: '', category: 'Other', subject: '', body: '' }); }}
          className="flex items-center gap-2 bg-app-text text-app-bg px-6 py-3 rounded-full font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {/* Category Tab Buttons */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-app-border">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-full font-sans text-xs font-black uppercase tracking-widest transition-all ${
              selectedCategory === cat
                ? 'bg-app-accent text-white shadow-[0_0_20px_rgba(255,95,31,0.4)] border border-app-accent'
                : 'border border-app-border text-app-text/60 hover:text-app-text hover:bg-app-text/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTemplates.map(t => (
            <motion.div 
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-app-card border border-app-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4 border-b border-app-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-app-accent/10 rounded-xl text-app-accent">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-app-text leading-tight">{t.title}</h3>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${getCategoryBadgeColor(t.category)}`}>
                        {t.category}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button 
                      onClick={() => handleEdit(t)}
                      className="p-1.5 hover:bg-app-accent/10 hover:text-app-accent rounded-full transition-colors text-app-text/40"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setTemplates(templates.filter(temp => temp.id !== t.id))}
                      className="p-1.5 hover:bg-ruby/10 hover:text-ruby rounded-full transition-colors text-app-text/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4 text-sm mt-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-app-text/40 mb-1">Subject</div>
                    <div className="font-semibold text-app-text truncate">{t.subject}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-app-text/40 mb-1">Body Preview</div>
                    <div className="text-app-text/70 line-clamp-3 leading-relaxed whitespace-pre-wrap">{t.body}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <Mail className="w-12 h-12 text-app-text/20 mx-auto mb-4" />
              <p className="text-app-text/50 font-medium">No templates available in this category.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {editingId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-app-bg/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-app-card border-2 border-app-border rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl space-y-6"
          >
            <h3 className="text-2xl font-serif font-black">{editingId === 0 ? 'New Template' : 'Edit Template'}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-app-text/50 mb-2">Template Title</label>
                  <input 
                    type="text" 
                    value={editForm.title}
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-app-text font-medium"
                    placeholder="e.g. Welcome Packet"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-app-text/50 mb-2">Category</label>
                  <select 
                    value={editForm.category}
                    onChange={e => setEditForm({...editForm, category: e.target.value as Category})}
                    className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-app-text font-medium focus:ring-2 focus:ring-app-accent focus:outline-none"
                  >
                    <option value="Move-In">Move-In</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Rent">Rent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-app-text/50 mb-2">Subject Line</label>
                <input 
                  type="text" 
                  value={editForm.subject}
                  onChange={e => setEditForm({...editForm, subject: e.target.value})}
                  className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-app-text font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-app-text/50 mb-2">Email Body (Supports variables like {'{{tenant_name}}'})</label>
                <textarea 
                  value={editForm.body}
                  onChange={e => setEditForm({...editForm, body: e.target.value})}
                  rows={8}
                  className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-app-text font-medium resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-app-border">
              <button 
                onClick={() => setEditingId(null)}
                className="px-6 py-2 rounded-full font-bold tracking-widest uppercase text-xs hover:bg-app-text/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-app-accent text-white rounded-full font-black tracking-widest uppercase text-xs hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Template
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
