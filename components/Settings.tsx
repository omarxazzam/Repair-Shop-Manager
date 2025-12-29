import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Save, Store, Calculator, Phone, MapPin, Globe } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">إعدادات النظام</h2>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Store size={16}/> اسم المحل / المركز
              </label>
              <input 
                type="text" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={localSettings.shopName}
                onChange={e => setLocalSettings({...localSettings, shopName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Globe size={16}/> العملة
              </label>
              <input 
                type="text" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={localSettings.currency}
                onChange={e => setLocalSettings({...localSettings, currency: e.target.value})}
                placeholder="مثال: ج.م"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Phone size={16}/> رقم الهاتف (للإيصالات)
              </label>
              <input 
                type="text" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={localSettings.phone}
                onChange={e => setLocalSettings({...localSettings, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Calculator size={16}/> نسبة الضريبة %
              </label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={localSettings.taxRate}
                onChange={e => setLocalSettings({...localSettings, taxRate: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16}/> العنوان
              </label>
              <textarea 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                value={localSettings.address}
                onChange={e => setLocalSettings({...localSettings, address: e.target.value})}
              />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
            <button 
              onClick={handleSave}
              className="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
            >
              <Save size={20} />
              حفظ الإعدادات
            </button>
            {saved && <span className="text-emerald-600 font-bold animate-pulse">تم الحفظ بنجاح!</span>}
          </div>

        </div>
      </div>
    </div>
  );
};
