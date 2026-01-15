
import React, { useState } from 'react';
import { AuditEntry, BundleAudit, HandHygieneAudit } from '../types';
import { Clock, AlertCircle, CheckCircle, ShieldCheck, CheckSquare, Hand, User, MapPin } from 'lucide-react';

interface HistoryViewProps {
  entries: AuditEntry[];
  bundleEntries?: BundleAudit[];
  hhEntries?: HandHygieneAudit[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ entries, bundleEntries = [], hhEntries = [] }) => {
  const [filter, setFilter] = useState<'ALL' | 'ISOLATION' | 'BUNDLE' | 'HH'>('ALL');

  const combined = [
    ...entries.map(e => ({ ...e, type: 'ISOLATION' as const })),
    ...bundleEntries.map(e => ({ ...e, type: 'BUNDLE' as const })),
    ...hhEntries.map(e => ({ ...e, type: 'HH' as const }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filtered = combined.filter(e => filter === 'ALL' || e.type === filter);

  if (combined.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
          <Clock className="text-slate-300" size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No History Yet</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm italic">Audit results will appear here once saved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-black text-slate-800">Unit Audit History</h2>
        <div className="flex bg-slate-200 p-1 rounded-xl overflow-x-auto">
          {(['ALL', 'ISOLATION', 'BUNDLE', 'HH'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-tighter transition-all whitespace-nowrap ${
                filter === f ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {f === 'HH' ? 'Hand Hygiene' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((entry: any) => {
          if (entry.type === 'ISOLATION') {
            const e = entry as AuditEntry;
            return (
              <div key={e.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-teal-400 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-700 font-black text-lg border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-all">
                      {e.room_number || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 text-sm">Room {e.room_number || 'N/A'}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${
                          e.isolation_verification.status === 'Matched' ? 'bg-green-100 text-green-700' :
                          e.isolation_verification.status === 'Mismatched' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {e.isolation_verification.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                        <ShieldCheck size={10} className="text-teal-500" />
                        Isolation Round • {new Date(e.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                  "{e.raw_note}"
                </p>
                <div className="flex flex-wrap gap-2">
                   {e.issues.map((issue, idx) => (
                    <span key={idx} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black border border-red-100 flex items-center gap-1 uppercase tracking-tighter">
                      <AlertCircle size={10} /> {issue}
                    </span>
                  ))}
                  {e.issues.length === 0 && (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black border border-green-100 flex items-center gap-1 uppercase tracking-tighter">
                      <CheckCircle size={10} /> Compliant
                    </span>
                  )}
                </div>
              </div>
            );
          } else if (entry.type === 'BUNDLE') {
            const b = entry as BundleAudit;
            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-blue-400 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 font-black text-lg border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {b.room_number || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 text-sm">Room {b.room_number}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${
                          b.is_compliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {b.bundle_type} • {b.is_compliant ? 'Compliant' : 'Issues'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                        <CheckSquare size={10} className="text-blue-500" />
                        Bundle Check • {new Date(b.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(b.items).map(([key, val]) => (
                    <div key={key} className={`px-2 py-1.5 rounded-lg border flex items-center gap-2 ${val ? 'bg-green-50/50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      {val ? <CheckCircle size={12} className="text-green-500" /> : <AlertCircle size={12} className="text-red-500" />}
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${val ? 'text-green-800' : 'text-red-800'}`}>{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          } else if (entry.type === 'HH') {
            const h = entry as HandHygieneAudit;
            return (
              <div key={h.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-teal-500 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border ${
                      h.action === 'Missed' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
                    }`}>
                      {h.room_number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 text-sm">{h.staff_role}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${
                          h.action === 'Missed' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                        }`}>
                          {h.action}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                        <Hand size={10} className="text-teal-500" />
                        Hand Hygiene • {new Date(h.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <MapPin size={12} className="text-slate-400" />
                  Moment: <span className="text-teal-600 ml-1">{h.moment}</span>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default HistoryView;
