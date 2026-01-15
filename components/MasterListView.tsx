
import React, { useState } from 'react';
import { Trash2, FileSpreadsheet, Plus, AlertCircle, CheckCircle, Clock, Info, Edit2, X, Save, RotateCcw } from 'lucide-react';
import { MasterRecord } from '../types';

interface MasterListViewProps {
  masterList: MasterRecord[];
  setMasterList: (list: MasterRecord[]) => void;
}

const MasterListView: React.FC<MasterListViewProps> = ({ masterList, setMasterList }) => {
  const [pasteArea, setPasteArea] = useState('');
  const [viewMode, setViewMode] = useState<'MAP' | 'TABLE'>('MAP');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<MasterRecord | null>(null);

  const handlePaste = () => {
    const rows = pasteArea.trim().split('\n');
    const newRecords: MasterRecord[] = rows.map(row => {
      const cols = row.split(/\t|,/);
      return {
        room_number: cols[0]?.trim() || '?',
        isolation_type: cols[1]?.trim() || 'Standard',
        organism: cols[2]?.trim() || 'None',
        verification_status: 'Pending'
      };
    }).filter(r => r.room_number !== '?');

    setMasterList([...masterList, ...newRecords]);
    setPasteArea('');
  };

  const clearList = () => {
    if (confirm("Clear unit records?")) setMasterList([]);
  };

  const resetStatus = () => {
    setMasterList(masterList.map(r => ({ ...r, verification_status: 'Pending', notes: '', last_observed: '' })));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...masterList[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editForm) {
      const newList = [...masterList];
      newList[editingIndex] = editForm;
      setMasterList(newList);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Import Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-teal-600" />
            <h2 className="text-xl font-bold text-slate-800">Master Isolation List</h2>
          </div>
          <div className="flex gap-4">
            <button onClick={resetStatus} className="text-slate-500 hover:text-teal-600 text-xs font-bold uppercase tracking-tighter flex items-center gap-1">
              <RotateCcw size={12} /> Reset Rounds
            </button>
            <button onClick={clearList} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-tighter flex items-center gap-1">
              <Trash2 size={12} /> Clear Unit
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <textarea
            value={pasteArea}
            onChange={(e) => setPasteArea(e.target.value)}
            placeholder="Paste from Excel: Room [Tab] Type [Tab] Organism"
            className="flex-1 h-16 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <button 
            onClick={handlePaste}
            className="px-6 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all flex flex-col items-center justify-center shadow-sm"
          >
            <Plus size={24} />
            <span className="text-[10px] uppercase">Import</span>
          </button>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Info size={18} className="text-teal-500" />
          Unit Status & Manual Edit
        </h3>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('MAP')} 
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'MAP' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
          >
            Unit Map
          </button>
          <button 
            onClick={() => setViewMode('TABLE')} 
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'TABLE' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'MAP' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {masterList.map((record, i) => (
            <div 
              key={i} 
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all p-4 flex flex-col gap-2 ${
                record.verification_status === 'Verified' ? 'bg-green-50 border-green-500' :
                record.verification_status === 'Mismatch' ? 'bg-red-50 border-red-500 shadow-red-100 shadow-lg' :
                'bg-white border-slate-200 opacity-90'
              }`}
            >
              <button 
                onClick={() => startEditing(i)}
                className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-slate-400 hover:text-teal-600 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 size={14} />
              </button>

              <div className="flex justify-between items-start">
                <span className={`text-xl font-black ${
                   record.verification_status === 'Mismatch' ? 'text-red-700' :
                   record.verification_status === 'Verified' ? 'text-green-700' :
                   'text-slate-800'
                }`}>
                  #{record.room_number}
                </span>
                {record.verification_status === 'Verified' && <CheckCircle size={18} className="text-green-500" />}
                {record.verification_status === 'Mismatch' && <AlertCircle size={18} className="text-red-500 animate-pulse" />}
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Master Data</div>
                <div className="text-sm font-bold text-slate-700 truncate">{record.organism}</div>
                <div className="text-[9px] text-slate-500 italic">{record.isolation_type}</div>
              </div>

              {record.notes && (
                <div className="mt-1 p-1.5 bg-white/50 rounded border border-slate-100 text-[10px] text-slate-600 italic">
                  {record.notes}
                </div>
              )}

              {record.verification_status === 'Mismatch' && record.last_observed && (
                <div className="mt-2 pt-2 border-t border-red-100">
                  <div className="text-[10px] font-bold text-red-400 uppercase">Observed Error</div>
                  <div className="text-sm font-black text-red-600">{record.last_observed}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-bold text-slate-600 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 font-bold text-slate-600 uppercase tracking-wider">Organism</th>
                <th className="px-6 py-3 font-bold text-slate-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {masterList.map((record, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">{record.room_number}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      record.verification_status === 'Verified' ? 'bg-green-100 text-green-700' :
                      record.verification_status === 'Mismatch' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {record.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{record.organism}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => startEditing(i)} className="text-teal-600 hover:text-teal-800">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingIndex !== null && editForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-teal-600 text-white">
              <h3 className="text-xl font-bold">Edit Room #{editForm.room_number}</h3>
              <button onClick={() => setEditingIndex(null)}><X /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Organism</label>
                <input 
                  type="text" 
                  value={editForm.organism}
                  onChange={e => setEditForm({...editForm, organism: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Isolation Type</label>
                <select 
                  value={editForm.isolation_type}
                  onChange={e => setEditForm({...editForm, isolation_type: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option>Standard</option>
                  <option>Contact</option>
                  <option>Droplet</option>
                  <option>Airborne</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Manual Verification Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pending', 'Verified', 'Mismatch'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setEditForm({...editForm, verification_status: status})}
                      className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                        editForm.verification_status === status 
                        ? (status === 'Verified' ? 'bg-green-100 border-green-500 text-green-700' : status === 'Mismatch' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-slate-200 border-slate-400 text-slate-700')
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {editForm.verification_status === 'Mismatch' && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-red-400 uppercase mb-1 block">Observed Reality / Error Note</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Actually VRE"
                    value={editForm.last_observed || ''}
                    onChange={e => setEditForm({...editForm, last_observed: e.target.value})}
                    className="w-full p-3 bg-red-50 border border-red-100 rounded-xl font-bold text-red-700 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setEditingIndex(null)}
                className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={saveEdit}
                className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 flex items-center justify-center gap-2"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterListView;
