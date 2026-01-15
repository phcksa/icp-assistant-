
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AuditView from './components/AuditView';
import BundleAuditView from './components/BundleAuditView';
import HandHygieneView from './components/HandHygieneView';
import HistoryView from './components/HistoryView';
import DashboardView from './components/DashboardView';
import MasterListView from './components/MasterListView';
import { AuditEntry, Tab, MasterRecord, BundleAudit, HandHygieneAudit } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.AUDIT);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [bundleHistory, setBundleHistory] = useState<BundleAudit[]>([]);
  const [hhHistory, setHhHistory] = useState<HandHygieneAudit[]>([]);
  const [masterList, setMasterList] = useState<MasterRecord[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('icp_history');
    const savedBundleHistory = localStorage.getItem('icp_bundle_history');
    const savedHhHistory = localStorage.getItem('icp_hh_history');
    const savedMaster = localStorage.getItem('icp_master_list');
    
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedBundleHistory) setBundleHistory(JSON.parse(savedBundleHistory));
    if (savedHhHistory) setHhHistory(JSON.parse(savedHhHistory));
    if (savedMaster) setMasterList(JSON.parse(savedMaster));
  }, []);

  useEffect(() => {
    localStorage.setItem('icp_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('icp_bundle_history', JSON.stringify(bundleHistory));
  }, [bundleHistory]);

  useEffect(() => {
    localStorage.setItem('icp_hh_history', JSON.stringify(hhHistory));
  }, [hhHistory]);

  useEffect(() => {
    localStorage.setItem('icp_master_list', JSON.stringify(masterList));
  }, [masterList]);

  const handleSaveEntry = (entry: AuditEntry) => {
    setHistory(prev => [entry, ...prev]);
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

  const handleSaveBundle = (entry: BundleAudit) => {
    setBundleHistory(prev => [entry, ...prev]);
    setActiveTab(Tab.HISTORY);
  };

  const handleSaveHH = (entry: HandHygieneAudit) => {
    setHhHistory(prev => [entry, ...prev]);
    setActiveTab(Tab.HISTORY);
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.AUDIT:
        return <AuditView onSave={handleSaveEntry} masterList={masterList} />;
      case Tab.BUNDLE_AUDIT:
        return <BundleAuditView onSave={handleSaveBundle} />;
      case Tab.HH_AUDIT:
        return <HandHygieneView onSave={handleSaveHH} />;
      case Tab.HISTORY:
        return <HistoryView entries={history} bundleEntries={bundleHistory} hhEntries={hhHistory} />;
      case Tab.DASHBOARD:
        return <DashboardView entries={history} bundleEntries={bundleHistory} hhEntries={hhHistory} />;
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
