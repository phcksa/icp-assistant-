
export interface IsolationVerification {
  status: 'Matched' | 'Mismatched' | 'Not Mentioned';
  observed_type: 'Contact' | 'Droplet' | 'Airborne' | 'Standard' | string;
  organism: string;
  sign_present: boolean | null;
  expected_organism?: string;
}

export interface MasterRecord {
  room_number: string;
  isolation_type: string;
  organism: string;
  verification_status?: 'Pending' | 'Verified' | 'Mismatch';
  last_observed?: string;
  notes?: string;
}

export interface HandHygiene {
  opportunity_detected: boolean;
  moment?: string;
  action?: 'Rub' | 'Wash' | 'Missed' | string;
  staff_role?: 'Nurse' | 'Doctor' | 'RT' | 'Other' | string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  raw_note: string;
  room_number: string | null;
  isolation_verification: IsolationVerification;
  issues: string[];
  hand_hygiene: HandHygiene;
  action_taken: boolean;
}

export type BundleType = 'CLABSI' | 'CAUTI' | 'VAP';

export interface BundleAudit {
  id: string;
  timestamp: string;
  room_number: string;
  bundle_type: BundleType;
  items: Record<string, boolean>;
  is_compliant: boolean;
  raw_note: string;
}

export interface HandHygieneAudit {
  id: string;
  timestamp: string;
  room_number: string;
  staff_role: string;
  moment: string;
  action: 'Rub' | 'Wash' | 'Missed';
  raw_note?: string;
}

export enum Tab {
  AUDIT = 'AUDIT',
  BUNDLE_AUDIT = 'BUNDLE_AUDIT',
  HH_AUDIT = 'HH_AUDIT',
  HISTORY = 'HISTORY',
  DASHBOARD = 'DASHBOARD',
  MASTER_LIST = 'MASTER_LIST'
}
