
import React, { useState } from 'react';
import { Mic, Send, Loader2, Save, Trash2, CheckCircle2, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { parseRoundingNote } from '../services/geminiService';
import { AuditEntry, MasterRecord } from '../types';

interface AuditViewProps {
  onSave: (entry: AuditEntry) => void;
  masterList: MasterRecord[];
}

const AuditView: React.FC<AuditViewProps> = ({ onSave, masterList }) => {
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition is not supported.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setNote(prev => prev + (prev ? ' ' : '') + speechToText);
    };
    recognition.start();
  };

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setIsProcessing(true);
    try {
      const result = await parseRoundingNote(note, masterList);
      setParsedData(result);
    } catch (error) {
      alert("Failed to process note.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = () => {
    if (!parsedData) return;
    const entry: AuditEntry = {
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
          <h2 className="text-xl font-bold text-slate-800">New Rounding Note</h2>
          {masterList.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
              <CheckCircle2 size={10} /> SYNCED WITH MASTER LIST
            </div>
          )}
        </div>
        <div className="relative">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثلاً: 'غرفة 12 العزل تمام بس اللوحة طايحة'"
            className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all resize-none text-slate-700"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-full transition-all ${
                isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              <Mic size={20} />
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !note.trim()}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Match & Analyze
            </button>
          </div>
        </div>
      </div>

      {parsedData && (
        <div className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          parsedData.isolation_verification.status === 'Mismatched' ? 'border-red-500' : 'border-teal-500'
        }`}>
          <div className={`p-4 text-white flex justify-between items-center ${
            parsedData.isolation_verification.status === 'Mismatched' ? 'bg-red-500' : 'bg-teal-500'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck />
              <h3 className="font-bold text-lg">Analysis Result</h3>
            </div>
            {parsedData.isolation_verification.status === 'Mismatched' && (
              <div className="bg-white/20 px-2 py-1 rounded text-xs font-bold animate-pulse">
                ACTION REQUIRED: DATA MISMATCH
              </div>
            )}
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Context</label>
                <div className="text-2xl font-bold text-slate-800">Room {parsedData.room_number || 'N/A'}</div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Isolation Verification</label>
                <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                  parsedData.isolation_verification.status === 'Matched' ? 'bg-green-100 text-green-700' :
                  parsedData.isolation_verification.status === 'Mismatched' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {parsedData.isolation_verification.status === 'Matched' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {parsedData.isolation_verification.status}
                </div>
                
                {parsedData.isolation_verification.status === 'Mismatched' && parsedData.isolation_verification.expected_organism && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="text-[10px] font-bold text-red-400 uppercase">Official Record (Excel)</div>
                    <div className="text-sm font-bold text-red-700">{parsedData.isolation_verification.expected_organism}</div>
                    <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase">Observed during Round</div>
                    <div className="text-sm font-bold text-slate-700">{parsedData.isolation_verification.organism}</div>
                  </div>
                )}

                {!parsedData.isolation_verification.expected_organism && (
                  <div className="mt-2 space-y-1">
                    <div className="text-slate-600 text-sm">Organism: <span className="font-bold">{parsedData.organism || parsedData.isolation_verification.organism}</span></div>
                    <div className="text-slate-600 text-sm">Type: <span className="font-bold">{parsedData.isolation_verification.observed_type}</span></div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
               <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes & Issues</label>
                <ul className="mt-2 space-y-1">
                  {parsedData.issues.length > 0 ? parsedData.issues.map((issue: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      {issue}
                    </li>
                  )) : (
                    <li className="text-sm text-green-600 font-medium italic">Compliant Environment</li>
                  )}
                </ul>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hand Hygiene Audit</label>
                {parsedData.hand_hygiene.opportunity_detected ? (
                  <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-sm font-medium text-slate-800">{parsedData.hand_hygiene.staff_role} • {parsedData.hand_hygiene.moment}</div>
                    <div className={`text-xs font-bold mt-1 ${parsedData.hand_hygiene.action === 'Missed' ? 'text-red-500' : 'text-green-600'}`}>
                      Action: {parsedData.hand_hygiene.action}
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-slate-400 italic">No HH audit data</div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${parsedData.action_taken ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400'}`}>
                {parsedData.action_taken ? 'Status: Corrected on spot' : 'Status: Observation logged'}
              </span>
              <div className="flex gap-3">
                <button onClick={() => setParsedData(null)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium flex items-center gap-2">
                  <Trash2 size={18} /> Discard
                </button>
                <button onClick={handleConfirmSave} className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 flex items-center gap-2 shadow-md transition-all active:scale-95">
                  <Save size={18} /> Log Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditView;
