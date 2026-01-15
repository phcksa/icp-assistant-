
import React from 'react';
import { AuditEntry, BundleAudit, HandHygieneAudit } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ShieldAlert, Hand, TrendingUp, CheckCircle, CheckSquare } from 'lucide-react';

interface DashboardViewProps {
  entries: AuditEntry[];
  bundleEntries?: BundleAudit[];
  hhEntries?: HandHygieneAudit[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ entries, bundleEntries = [], hhEntries = [] }) => {
  const totalRounds = entries.length;
  
  const isolationMatches = entries.filter(e => e.isolation_verification.status === 'Matched').length;
  const isoCompliance = totalRounds > 0 ? Math.round((isolationMatches / totalRounds) * 100) : 0;
  
  const totalHH = hhEntries.length;
  const hhCompliant = hhEntries.filter(e => e.action !== 'Missed').length;
  const hhRate = totalHH > 0 ? Math.round((hhCompliant / totalHH) * 100) : 100;

  const totalBundles = bundleEntries.length;
  const bundleCompliant = bundleEntries.filter(e => e.is_compliant).length;
  const bundleRate = totalBundles > 0 ? Math.round((bundleCompliant / totalBundles) * 100) : 100;

  const COLORS = ['#0d9488', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'];

  // HH by Role Data
  const roleDataMap = hhEntries.reduce((acc: any, curr) => {
    acc[curr.staff_role] = (acc[curr.staff_role] || 0) + 1;
    return acc;
  }, {});
  const roleData = Object.keys(roleDataMap).map(name => ({ name, value: roleDataMap[name] }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800">Quality Metrics</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <TrendingUp className="text-teal-500 mb-2" size={24} />
          <div className="text-3xl font-black text-slate-800">{totalRounds + totalBundles + totalHH}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Audits</div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <CheckCircle className="text-green-500 mb-2" size={24} />
          <div className="text-3xl font-black text-slate-800">{isoCompliance}%</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Isolation Compliance</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <Hand className="text-blue-500 mb-2" size={24} />
          <div className="text-3xl font-black text-slate-800">{hhRate}%</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HH Compliance</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <CheckSquare className="text-purple-500 mb-2" size={24} />
          <div className="text-3xl font-black text-slate-800">{bundleRate}%</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bundle Compliance</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Hand size={18} className="text-blue-500" /> HH Audits by Role
          </h3>
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {roleData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No HH data available</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
             <TrendingUp size={18} className="text-teal-500" /> Recent Compliance
          </h3>
          <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
             Log more audits to see trend visualization
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
