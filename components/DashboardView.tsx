
import React from 'react';
import { AuditEntry } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ShieldAlert, Hand, TrendingUp, CheckCircle } from 'lucide-react';

interface DashboardViewProps {
  entries: AuditEntry[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ entries }) => {
  const totalRounds = entries.length;
  
  const isolationMatches = entries.filter(e => e.isolation_verification.status === 'Matched').length;
  const matchRate = totalRounds > 0 ? Math.round((isolationMatches / totalRounds) * 100) : 0;
  
  const hhOpportunities = entries.filter(e => e.hand_hygiene.opportunity_detected);
  const hhCompliance = hhOpportunities.length > 0 
    ? Math.round((hhOpportunities.filter(e => e.hand_hygiene.action !== 'Missed').length / hhOpportunities.length) * 100)
    : 100;

  const totalIssues = entries.reduce((acc, curr) => acc + curr.issues.length, 0);

  // Chart Data: Organisms
  const organismDataMap = entries.reduce((acc: any, curr) => {
    const org = curr.isolation_verification.organism || 'Unknown';
    if (org !== 'N/A' && org !== 'Unknown' && org !== 'None') {
      acc[org] = (acc[org] || 0) + 1;
    }
    return acc;
  }, {});
  const organismData = Object.keys(organismDataMap).map(name => ({ name, value: organismDataMap[name] }));

  // Chart Data: Issues by Type
  const issueDataMap = entries.flatMap(e => e.issues).reduce((acc: any, issue) => {
    acc[issue] = (acc[issue] || 0) + 1;
    return acc;
  }, {});
  const issueData = Object.keys(issueDataMap).map(name => ({ name, count: issueDataMap[name] })).sort((a, b) => b.count - a.count).slice(0, 5);

  const COLORS = ['#0d9488', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Quality Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={20} />
          </div>
          <div className="text-2xl font-black text-slate-800">{totalRounds}</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Total Rounds</div>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${matchRate > 80 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <CheckCircle size={20} />
          </div>
          <div className="text-2xl font-black text-slate-800">{matchRate}%</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Isolation Compliance</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Hand size={20} />
          </div>
          <div className="text-2xl font-black text-slate-800">{hhCompliance}%</div>
          <div className="text-xs font-bold text-slate-400 uppercase">HH Compliance</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-3">
            <ShieldAlert size={20} />
          </div>
          <div className="text-2xl font-black text-slate-800">{totalIssues}</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Flagged Issues</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organism Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
          <h3 className="font-bold text-slate-700 mb-4">Isolation Organisms</h3>
          {organismData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={organismData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {organismData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No data available</div>
          )}
        </div>

        {/* Top Issues */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
          <h3 className="font-bold text-slate-700 mb-4">Top Compliance Issues</h3>
          {issueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No issues recorded</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
