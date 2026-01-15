
import React, { useState } from 'react';
import { Send, Loader2, Save, Trash2, CheckCircle2, AlertTriangle, Zap, Syringe, Wind, FlaskConical } from 'lucide-react';
import { parseBundleNote } from '../services/geminiService';
import { BundleAudit } from '../types';

interface BundleAuditViewProps {
  onSave: (entry: BundleAudit) => void;
}

const BUNDLE_METADATA = {
  CLABSI: { icon: Syringe, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  CAUTI: { icon: FlaskConical, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  VAP: { icon: Wind, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
};

const ITEM_LABELS: Record<string, string> = {
  hh: 'Hand Hygiene',
  dressing: 'Dressing Intact',
  scrub: 'Hub Scrubbed',
  necessity: 'Line Necessity',
  securement: 'Statlock Present',
  bag: 'Bag below/off floor',
  closed: 'System Closed',
  flow: 'Urine Flowing',
  hob: 'HOB 30-45°',
  sedation: 'Sedation Vacation',
  oral: 'Oral Care (CHG)',
  cuff: 'Cuff Pressure',
};

const BundleAuditView: React.FC<BundleAuditViewProps> = ({ onSave }) => {
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setIsProcessing(true);
    try {
      const result = await parseBundleNote(note);
      setParsedData(result);
    } catch (error) {
      alert("Failed to process bundle note.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItem = (key: string) => {
    if (!parsedData) return;
    const newItems = { ...parsedData.items, [key]: !parsedData.items[key] };
    const isCompliant = Object.values(newItems).every(v => v === true);
    setParsedData({ ...parsedData, items: newItems, is_compliant: isCompliant });
  };

  const handleConfirmSave = () => {
    if (!parsedData) return;
    const entry: BundleAudit = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      raw_note: note,
      ...parsedData
    };
    onSave(entry);
    setNote('');
    setParsedData(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Bundle Checklist Audit</h2>
            <p className="text-xs text-slate-400 mt-1">اكتب ملاحظات الحزمة (CLABSI, CAUTI, VAP) للتحليل.</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(BUNDLE_METADATA).map(([key, meta]) => (
              <div key={key} className={`p-1.5 rounded-lg border ${meta.border} ${meta.bg} ${meta.color}`}>
                <meta.icon size={16} />
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثلاً: 'غرفة 5 قسطرة بولية، الكيس على الأرض'..."
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all resize-none text-slate-700 text-right"
            dir="auto"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !note.trim()}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="text-teal-400" />}
              Audit Bundle
            </button>
          </div>
        </div>
      </div>

      {parsedData && (
        <div className={`bg-white rounded-3xl shadow-xl border-2 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          parsedData.is_compliant ? 'border-green-500' : 'border-red-500'
        }`}>
          {/* Result view same as before */}
          <div className={`p-4 text-white flex justify-between items-center ${
            parsedData.is_compliant ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={24} />
              <h3 className="font-bold text-lg">{parsedData.bundle_type} Verification</h3>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(parsedData.items).map(([key, val]) => (
                <button key={key} onClick={() => toggleItem(key)} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${val ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                   <span className="font-bold text-sm">{ITEM_LABELS[key] || key}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <button onClick={() => setParsedData(null)} className="px-6 py-3 text-slate-500 font-bold">Discard</button>
                <button onClick={handleConfirmSave} className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl">Log Bundle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleAuditView;
