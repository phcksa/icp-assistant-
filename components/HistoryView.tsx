
import React from 'react';
import { AuditEntry } from '../types';
import { Clock, UserCircle, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

interface HistoryViewProps {
  entries: AuditEntry[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
          <Clock className="text-slate-300" size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No History Yet</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-2">Parsed rounding notes will appear here once saved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">Recent Rounds</h2>
      {entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((entry) => (
        <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-teal-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">
                {entry.room_number || '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Room {entry.room_number || 'N/A'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    entry.isolation_verification.status === 'Matched' ? 'bg-green-100 text-green-700' :
                    entry.isolation_verification.status === 'Mismatched' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {entry.isolation_verification.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            {entry.action_taken && (
              <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-1 rounded border border-teal-100">
                FIXED
              </span>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded">
              "{entry.raw_note}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-tighter">Details</span>
              <div className="text-slate-700 mt-1 font-medium">{entry.isolation_verification.organism} ({entry.isolation_verification.observed_type})</div>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-tighter">Hand Hygiene</span>
              <div className={`mt-1 font-medium ${entry.hand_hygiene.opportunity_detected ? (entry.hand_hygiene.action === 'Missed' ? 'text-red-600' : 'text-green-600') : 'text-slate-400'}`}>
                {entry.hand_hygiene.opportunity_detected ? `${entry.hand_hygiene.staff_role}: ${entry.hand_hygiene.action}` : 'None'}
              </div>
            </div>
          </div>
          
          {entry.issues.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
              {entry.issues.map((issue, idx) => (
                <span key={idx} className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-medium border border-red-100 flex items-center gap-1">
                  <AlertCircle size={10} />
                  {issue}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HistoryView;
