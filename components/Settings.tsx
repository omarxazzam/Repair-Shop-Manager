
import React, { useState } from 'react';
import { AppSettings, VisualStyle } from '../types';
// Import StorageService to provide access to its utility methods (e.g., generateId)
import { StorageService } from '../services/storage';
import { Save, Store, Calculator, Phone, MapPin, Globe, Palette, Moon, Sun, Type, LayoutTemplate, Box, Sparkles, Layers, Zap, Printer, CheckSquare, Square } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'print'>('general');
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

  const togglePrintField = (field: keyof typeof settings.printConfig) => {
    setLocalSettings({
      ...localSettings,
      printConfig: {
        ...localSettings.printConfig,
        [field]: !localSettings.printConfig[field]
      }
    });
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
        <div className="flex bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700 overflow-x-auto">
          <button onClick={() => setActiveTab('general')} className={`px-8 py-4 font-bold whitespace-nowrap transition-all ${activeTab === 'general' ? 'border-b-4 border-primary text-primary bg-white dark:bg-slate-800' : 'text-slate-500'}`}>الإعدادات العامة</button>
          <button onClick={() => setActiveTab('theme')} className={`px-8 py-4 font-bold whitespace-nowrap transition-all ${activeTab === 'theme' ? 'border-b-4 border-primary text-primary bg-white dark:bg-slate-800' : 'text-slate-500'}`}>المظهر والأنماط</button>
          <button onClick={() => setActiveTab('print')} className={`px-8 py-4 font-bold whitespace-nowrap transition-all ${activeTab === 'print' ? 'border-b-4 border-primary text-primary bg-white dark:bg-slate-800' : 'text-slate-500'}`}>إعدادات الطباعة</button>
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
          ) : activeTab === 'theme' ? (
            <div className="space-y-10">
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div>
                  <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-primary">
                    <Printer size={20}/> تخصيص بيانات ملصق الاستلام (4*3سم)
                  </h4>
                  <p className="text-xs text-slate-500 mb-8">اختر البيانات التي تريد ظهورها عند طباعة ملصق الباركود الحراري للاستلام.</p>
                  
                  <div className="space-y-4">
                     {[
                       { key: 'showShopName', label: 'اسم المركز' },
                       { key: 'showId', label: 'رقم التذكرة (Barcode)' },
                       { key: 'showCustomerName', label: 'اسم العميل' },
                       { key: 'showDeviceModel', label: 'موديل الجهاز' },
                       { key: 'showIssue', label: 'وصف العطل' },
                       { key: 'showDate', label: 'تاريخ الاستلام' },
                       { key: 'showCost', label: 'السعر المتفق عليه' },
                     ].map((field) => (
                       <button 
                        key={field.key}
                        onClick={() => togglePrintField(field.key as any)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${localSettings.printConfig[field.key as keyof typeof localSettings.printConfig] ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-700'}`}
                       >
                         <span className="font-bold text-slate-700 dark:text-slate-200">{field.label}</span>
                         {localSettings.printConfig[field.key as keyof typeof localSettings.printConfig] ? <CheckSquare className="text-primary" /> : <Square className="text-slate-300" />}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">معاينة حية للملصق (40mm x 30mm)</h5>
                  <div 
                    className="bg-white text-black border shadow-2xl overflow-hidden p-2 flex flex-col justify-between"
                    style={{ width: '151px', height: '113px', fontSize: '9px', lineHeight: '1.2' }} // Scale down approx 1:1 on screen
                  >
                     {localSettings.printConfig.showShopName && <div className="font-black text-center border-b pb-1 mb-1" style={{fontSize: '10px'}}>{localSettings.shopName}</div>}
                     <div className="flex-1 space-y-1">
                        {localSettings.printConfig.showId && <div className="font-bold">#T-{StorageService.generateId().slice(0,4).toUpperCase()}</div>}
                        {localSettings.printConfig.showCustomerName && <div className="truncate"><span className="opacity-50 font-medium">العميل:</span> أحمد محمد</div>}
                        {localSettings.printConfig.showDeviceModel && <div className="truncate"><span className="opacity-50 font-medium">الجهاز:</span> iPhone 13 Pro</div>}
                        {localSettings.printConfig.showIssue && <div className="line-clamp-2"><span className="opacity-50 font-medium">العطل:</span> تغيير شاشة خارجية أصلية</div>}
                     </div>
                     <div className="flex justify-between items-end border-t pt-1 mt-1" style={{fontSize: '8px'}}>
                        {localSettings.printConfig.showDate && <span>2024/05/20</span>}
                        {localSettings.printConfig.showCost && <span className="font-black">1500 {localSettings.currency}</span>}
                     </div>
                  </div>
                  <p className="mt-6 text-[10px] text-center text-slate-400 font-bold max-w-[200px]">هذه المعاينة توضح التنسيق التقريبي فقط، تختلف النتيجة حسب نوع الطابعة.</p>
               </div>
            </div>
          )}
        </div>
      </div>
      {saved && <div className="fixed bottom-10 left-10 bg-emerald-500 text-white px-10 py-4 rounded-2xl shadow-2xl animate-bounce font-bold z-50">تم تطبيق التغييرات بنجاح! ✨</div>}
    </div>
  );
};
