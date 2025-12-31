import React, { useState } from 'react';
import { AppSettings, VisualStyle } from '../types';
import { Save, Store, Calculator, Phone, MapPin, Globe, Palette, Moon, Sun, Type, LayoutTemplate, Box, Sparkles, Layers, Zap } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'theme'>('general');
  const [saved, setSaved] = useState(false);

  const colors = [
    { name: 'أزرق', value: '#2563eb' },
    { name: 'زمردي', value: '#10b981' },
    { name: 'بنفسجي', value: '#8b5cf6' },
    { name: 'برتقالي', value: '#f59e0b' },
    { name: 'وردي', value: '#ec4899' },
  ];

  const styles = [
    { id: 'professional', name: 'احترافي', icon: Box, desc: 'تصميم متزن ورسمي' },
    { id: 'glass', name: 'زجاجي عصري', icon: Sparkles, desc: 'شفافية وتأثيرات ضوئية' },
    { id: 'minimal', name: 'بسيط وجريء', icon: Zap, desc: 'تركيز عالي وحواف حادة' },
    { id: 'soft', name: 'ناعم وهادئ', icon: Layers, desc: 'ظلال ناعمة وتجربة مريحة' },
  ];

  const handleSave = () => {
    onUpdate(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">تخصيص النظام</h2>
        <button onClick={handleSave} className="bg-primary hover:scale-105 transition-all text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg">
          <Save size={18} /> حفظ كل التغييرات
        </button>
      </div>

      <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-500`}>
        <div className="flex bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
          <button onClick={() => setActiveTab('general')} className={`px-8 py-4 font-bold transition-all ${activeTab === 'general' ? 'border-b-4 border-primary text-primary bg-white dark:bg-slate-800' : 'text-slate-500'}`}>الإعدادات العامة</button>
          <button onClick={() => setActiveTab('theme')} className={`px-8 py-4 font-bold transition-all ${activeTab === 'theme' ? 'border-b-4 border-primary text-primary bg-white dark:bg-slate-800' : 'text-slate-500'}`}>المظهر والأنماط</button>
        </div>

        <div className="p-8">
          {activeTab === 'general' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold opacity-60 flex items-center gap-2"><Store size={14}/> اسم المركز</label>
                <input type="text" className="w-full p-4 rounded-xl border dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" value={localSettings.shopName} onChange={e => setLocalSettings({...localSettings, shopName: e.target.value})} />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold opacity-60 flex items-center gap-2"><Globe size={14}/> العملة</label>
                <input type="text" className="w-full p-4 rounded-xl border dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" value={localSettings.currency} onChange={e => setLocalSettings({...localSettings, currency: e.target.value})} />
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Visual Styles Presets */}
              <div>
                <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-primary">
                  <Sparkles size={20}/> الهوية البصرية للبرنامج
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {styles.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setLocalSettings({...localSettings, theme: {...localSettings.theme, visualStyle: s.id as VisualStyle}})}
                      className={`p-5 rounded-2xl border-2 text-right transition-all group ${localSettings.theme.visualStyle === s.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${localSettings.theme.visualStyle === s.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'} transition-colors`}>
                          <s.icon size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{s.name}</p>
                          <p className="text-xs opacity-50">{s.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t dark:border-slate-700">
                {/* Primary Color */}
                <div>
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Palette size={18}/> لون الهوية</h4>
                  <div className="flex flex-wrap gap-3">
                    {colors.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setLocalSettings({...localSettings, theme: {...localSettings.theme, primaryColor: c.value}})}
                        className={`w-12 h-12 rounded-full border-4 transition-transform hover:scale-110 ${localSettings.theme.primaryColor === c.value ? 'border-white ring-4 ring-primary shadow-lg scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Night Mode Switch */}
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl flex items-center justify-between border dark:border-slate-700">
                   <div className="flex items-center gap-4">
                      {localSettings.theme.darkMode ? <Moon className="text-yellow-400" size={28}/> : <Sun className="text-orange-500" size={28}/>}
                      <div>
                        <p className="font-bold">الوضع الليلي</p>
                        <p className="text-xs opacity-50">تبديل بين الثيم المضيء والمظلم</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setLocalSettings({...localSettings, theme: {...localSettings.theme, darkMode: !localSettings.theme.darkMode}})}
                    className={`w-16 h-8 rounded-full transition-colors relative ${localSettings.theme.darkMode ? 'bg-primary' : 'bg-slate-300'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${localSettings.theme.darkMode ? 'right-9' : 'right-1'}`} />
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {saved && <div className="fixed bottom-10 left-10 bg-emerald-500 text-white px-10 py-4 rounded-2xl shadow-2xl animate-bounce font-bold z-50">تم تطبيق التغييرات بنجاح! ✨</div>}
    </div>
  );
};
