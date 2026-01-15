
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AuditView from './components/AuditView';
import HistoryView from './components/HistoryView';
import DashboardView from './components/DashboardView';
import MasterListView from './components/MasterListView';
import { AuditEntry, Tab, MasterRecord } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.AUDIT);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [masterList, setMasterList] = useState<MasterRecord[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('icp_history');
    const savedMaster = localStorage.getItem('icp_master_list');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedMaster) setMasterList(JSON.parse(savedMaster));
  }, []);

  useEffect(() => {
    localStorage.setItem('icp_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('icp_master_list', JSON.stringify(masterList));
  }, [masterList]);

  const handleSaveEntry = (entry: AuditEntry) => {
    setHistory(prev => [entry, ...prev]);
    
    // Sync logic: Update Master List status based on audit
    if (entry.room_number) {
      setMasterList(prev => prev.map(record => {
        if (record.room_number === entry.room_number) {
          const isMismatch = entry.isolation_verification.status === 'Mismatched';
          return {
            ...record,
            verification_status: isMismatch ? 'Mismatch' : 'Verified',
            last_observed: entry.isolation_verification.organism,
            notes: isMismatch ? `Observed: ${entry.isolation_verification.organism}` : ''
          };
        }
        return record;
      }));
    }
    
    setActiveTab(Tab.HISTORY);
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.AUDIT:
        return <AuditView onSave={handleSaveEntry} masterList={masterList} />;
      case Tab.HISTORY:
        return <HistoryView entries={history} />;
      case Tab.DASHBOARD:
        return <DashboardView entries={history} />;
      case Tab.MASTER_LIST:
        return <MasterListView masterList={masterList} setMasterList={setMasterList} />;
      default:
        return <AuditView onSave={handleSaveEntry} masterList={masterList} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
