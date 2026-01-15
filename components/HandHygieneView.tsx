
import React, { useState } from 'react';
import { Send, Loader2, Save, Trash2, Hand, User, Sparkles, CheckCircle2, XCircle, Droplets, ShieldCheck, MapPin, Briefcase } from 'lucide-react';
import { parseHHNote } from '../services/geminiService';
import { HandHygieneAudit } from '../types';

interface HandHygieneViewProps {
  onSave: (entry: HandHygieneAudit) => void;
}

const STAFF_ROLES = [
  { id: 'Nurse', label: 'Nurse', icon: User },
  { id: 'Doctor', label: 'Doctor', icon: User },
  { id: 'RT', label: 'RT', icon: User },
  { id: 'Housekeeping', label: 'H.Keeping', icon: User },
  { id: 'Other', label: 'Other', icon: User },
];

const MOMENTS = [
  { id: 'Before Patient Touch', label: '1. Before Patient Contact', desc: 'Protect patient from germs on your hands.' },
  { id: 'Before Aseptic Procedure', label: '2. Before Aseptic Task', desc: 'Protect patient from their own & your germs.' },
  { id: 'After Body Fluid Exposure', label: '3. After Body Fluid Risk', desc: 'Protect yourself & the environment.' },
  { id: 'After Patient Touch', label: '4. After Patient Contact', desc: 'Protect yourself & the environment.' },
  { id: 'After Touch Surroundings', label: '5. After Surroundings', desc: 'Protect yourself & the environment.' },
];

const ACTIONS = [
  { id: 'Rub', label: 'Gel / Rub', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'Wash', label: 'Water / Wash', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'Missed', label: 'Missed / Failed', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
];

const HandHygieneView: React.FC<HandHygieneViewProps> = ({ onSave }) => {
  const [mode, setMode] = useState<'AI' | 'MANUAL'>('MANUAL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [note, setNote] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);

  // Manual Form State
  const [mRoom, setMRoom] = useState('');
  const [mRole, setMRole] = useState('Nurse');
  const [mMoment, setMMoment] = useState(MOMENTS[0].id);
  const [mAction, setMAction] = useState<'Rub' | 'Wash' | 'Missed'>('Rub');

  const handleAiSubmit = async () => {
    if (!note.trim()) return;
    setIsProcessing(true);
    try {
      const result = await parseHHNote(note);
      setParsedData(result);
    } catch (error) {
      alert("Failed to process HH note.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAiSave = () => {
    if (!parsedData) return;
    const entry: HandHygieneAudit = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      raw_note: note,
      ...parsedData
    };
    onSave(entry);
    setNote('');
    setParsedData(null);
  };

  const handleManualSave = () => {
    if (!mRoom) {
      alert("Please enter a room number.");
      return;
    }
    const entry: HandHygieneAudit = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      room_number: mRoom,
      staff_role: mRole,
      moment: mMoment,
      action: mAction,
      raw_note: "Manual Logging"
    };
    onSave(entry);
    setMRoom('');
    // Reset defaults or keep role for consecutive audits
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher - Clean & Modern */}
      <div className="flex bg-slate-200 p-1 rounded-2xl shadow-inner border border-slate-200">
        <button
          onClick={() => setMode('MANUAL')}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            mode === 'MANUAL' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Hand size={14} /> MANUAL LOGGER
        </button>
        <button
          onClick={() => setMode('AI')}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            mode === 'AI' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles size={14} /> AI ANALYZER
        </button>
      </div>

      {mode === 'MANUAL' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header with Room Input */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="text-teal-600" size={20} />
                  Hand Hygiene Opportunity
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Observation Log</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Room #</span>
                <input
                  type="text"
                  placeholder="---"
                  value={mRoom}
                  onChange={(e) => setMRoom(e.target.value)}
                  className="w-20 p-2 text-center font-black text-lg bg-white border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* 1. Staff Role */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <Briefcase size={12} />
                  </div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Staff Category</label>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {STAFF_ROLES.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setMRole(role.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        mRole === role.id 
                        ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-100 scale-105 z-10' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <role.icon size={18} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{role.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* 2. The 5 Moments - Visual List */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <MapPin size={12} />
                  </div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">The 5 Moments</label>
                </div>
                <div className="space-y-2">
                  {MOMENTS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMMoment(m.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${
                        mMoment === m.id 
                        ? 'bg-blue-50 border-blue-500 ring-4 ring-blue-50' 
                        : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        mMoment === m.id ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'
                      }`}>
                        {mMoment === m.id && <CheckCircle2 size={12} />}
                      </div>
                      <div>
                        <div className={`text-xs font-black uppercase tracking-tight ${mMoment === m.id ? 'text-blue-800' : 'text-slate-600'}`}>
                          {m.label}
                        </div>
                        <div className={`text-[10px] font-bold mt-0.5 ${mMoment === m.id ? 'text-blue-500' : 'text-slate-400'}`}>
                          {m.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* 3. Action / Outcome */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Hand size={12} />
                  </div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Observation Outcome</label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {ACTIONS.map(act => (
                    <button
                      key={act.id}
                      onClick={() => setMAction(act.id as any)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${
                        mAction === act.id 
                        ? `${act.bg} ${act.border} ${act.color} shadow-xl scale-105 z-10` 
                        : 'bg-white border-slate-100 text-slate-300 opacity-60'
                      }`}
                    >
                      <act.icon size={28} />
                      <span className="text-xs font-black uppercase">{act.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Save Button */}
              <button
                onClick={handleManualSave}
                disabled={!mRoom}
                className="w-full py-5 bg-teal-600 text-white rounded-3xl font-black text-xl shadow-2xl shadow-teal-100 hover:bg-teal-700 disabled:opacity-30 flex items-center justify-center gap-4 transition-all active:scale-95"
              >
                <Save size={24} /> LOG AUDIT
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'AI' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Sparkles className="text-teal-500" />
              Smart Note Extraction
            </h2>
            <div className="relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="اكتب ملاحظة غسل اليدين هنا... (مثلاً: النيرس في غرفة 12 لم تعقم يدها قبل ملامسة المريض)"
                className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-teal-50 focus:border-teal-500 transition-all resize-none text-slate-700 text-right text-lg font-medium leading-relaxed"
                dir="auto"
              />
              <div className="absolute bottom-6 right-6 flex gap-3">
                <button
                  onClick={handleAiSubmit}
                  disabled={isProcessing || !note.trim()}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 disabled:opacity-50 flex items-center gap-3 shadow-2xl transition-all active:scale-95"
                >
                  {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="text-teal-400" />}
                  PROCESS NOTE
                </button>
              </div>
            </div>
          </div>

          {parsedData && (
            <div className={`bg-white rounded-3xl shadow-2xl border-2 overflow-hidden animate-in zoom-in duration-300 ${
              parsedData.action === 'Missed' ? 'border-rose-500' : 'border-emerald-500'
            }`}>
              <div className={`p-6 text-white flex justify-between items-center ${
                parsedData.action === 'Missed' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={24} />
                  <h3 className="font-black text-xl">Verification Required</h3>
                </div>
                <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest">
                  Room {parsedData.room_number || '??'}
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Role</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                        <User size={20} />
                      </div>
                      <span className="font-black text-slate-800 text-lg">{parsedData.staff_role}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Outcome</label>
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
                      parsedData.action === 'Missed' 
                      ? 'bg-rose-50 border-rose-100 text-rose-700' 
                      : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    }`}>
                      {parsedData.action === 'Missed' ? <XCircle size={24}/> : <Sparkles size={24}/>}
                      <span className="font-black text-lg uppercase">{parsedData.action}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-8">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extracted Moment</label>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                    <MapPin className="text-blue-500 mt-1 shrink-0" size={20} />
                    <span className="font-bold text-blue-900 leading-tight">{parsedData.moment}</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setParsedData(null)} 
                    className="flex-1 py-4 text-slate-500 font-black hover:bg-slate-50 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} /> DISCARD
                  </button>
                  <button 
                    onClick={handleConfirmAiSave} 
                    className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Save size={20} className="text-teal-400" /> CONFIRM & LOG
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HandHygieneView;
