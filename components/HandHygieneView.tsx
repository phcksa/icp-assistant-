
import React, { useState } from 'react';
import { Send, Loader2, Save, Trash2, Hand, User, Sparkles } from 'lucide-react';
import { parseHHNote } from '../services/geminiService';
import { HandHygieneAudit } from '../types';

interface HandHygieneViewProps {
  onSave: (entry: HandHygieneAudit) => void;
}

const STAFF_ROLES = ["Nurse", "Doctor", "RT", "Housekeeping", "Other"];
const MOMENTS = [
  "Before Patient Touch",
  "Before Aseptic Procedure",
  "After Body Fluid Exposure",
  "After Patient Touch",
  "After Touch Surroundings"
];
const ACTIONS = ["Rub", "Wash", "Missed"];

const HandHygieneView: React.FC<HandHygieneViewProps> = ({ onSave }) => {
  const [mode, setMode] = useState<'AI' | 'MANUAL'>('AI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [note, setNote] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);

  // Manual Form State
  const [mRoom, setMRoom] = useState('');
  const [mRole, setMRole] = useState('Nurse');
  const [mMoment, setMMoment] = useState(MOMENTS[0]);
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
      raw_note: "Manual Entry"
    };
    onSave(entry);
    setMRoom('');
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
        <button
          onClick={() => setMode('AI')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            mode === 'AI' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Sparkles size={16} /> AI Text Observation
        </button>
        <button
          onClick={() => setMode('MANUAL')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            mode === 'MANUAL' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Hand size={16} /> Manual Logger
        </button>
      </div>

      {mode === 'AI' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-black text-slate-800 mb-4">HH Note Analysis</h2>
            <div className="relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="اكتب ملاحظة غسل اليدين... (مثلاً: النيرس في غرفة 12 لم تعقم يدها قبل ملامسة المريض)"
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all resize-none text-slate-700 text-right"
                dir="auto"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={handleAiSubmit}
                  disabled={isProcessing || !note.trim()}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Analyze HH
                </button>
              </div>
            </div>
          </div>
          {/* Results preview same as before */}
          {parsedData && (
             <div className="p-6 bg-white rounded-2xl shadow-xl border-2 border-teal-500">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">HH Analysis: Room {parsedData.room_number}</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setParsedData(null)} className="text-slate-500">Discard</button>
                        <button onClick={handleConfirmAiSave} className="bg-teal-600 text-white px-4 py-2 rounded-lg">Save</button>
                    </div>
                </div>
             </div>
          )}
        </div>
      )}

      {mode === 'MANUAL' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="font-bold">Manual HH Entry</h3>
              <input type="text" placeholder="Room" value={mRoom} onChange={e => setMRoom(e.target.value)} className="w-20 border p-2 rounded text-center" />
           </div>
           <button onClick={handleManualSave} className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold">Log HH Opportunity</button>
        </div>
      )}
    </div>
  );
};

export default HandHygieneView;
