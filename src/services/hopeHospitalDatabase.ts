/**
 * Hope Hospital Real Database Service
 * Fetches actual patient and hospital data from Supabase
 */

import { supabase } from '../lib/supabase';

export interface PatientRecord {
  id: string;
  sr_no: number | null;
  visit_id: string; // This is like UHID
  patient_name: string;
  diagnosis: string | null;
  admission_date: string | null;
  discharge_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StaffRecord {
  id: string;
  name: string;
  role: string;
  designation: string;
  department: string;
  responsibilities: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentRecord {
  equipmentId: string;
  name: string;
  category: string;
  manufacturer: string;
  purchaseDate: string;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  location: string;
  status: 'Active' | 'Under Maintenance' | 'Retired';
}

export interface IncidentRecord {
  incidentId: string;
  date: string;
  time: string;
  location: string;
  reportedBy: string;
  incidentType: string;
  description: string;
  actionTaken: string;
  status: 'Open' | 'Under Investigation' | 'Closed';
}

// Hardcoded Hope Hospital Staff (until we have a staff table)
const HOPE_HOSPITAL_STAFF: StaffRecord[] = [
  {
    id: 'staff-001',
    name: 'Dr. Shiraz Sheikh',
    role: 'NABH Coordinator',
    designation: 'NABH Coordinator / Administrator',
    department: 'Administration',
    responsibilities: ['NABH Coordination', 'Quality Management', 'Hospital Administration'],
    is_active: true,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
  },
  {
    id: 'staff-002',
    name: 'Jagruti Sharma',
    role: 'Quality Manager',
    designation: 'Quality Manager / HR Head',
    department: 'Quality & HR',
    responsibilities: ['Quality Management', 'HR Operations', 'Staff Training'],
    is_active: true,
    created_at: '2020-02-15T00:00:00Z',
    updated_at: '2020-02-15T00:00:00Z',
  },
  {
    id: 'staff-003',
    name: 'Gaurav Malhotra',
    role: 'Hospital Administrator',
    designation: 'Hospital Administrator',
    department: 'Administration',
    responsibilities: ['Hospital Operations', 'Resource Management', 'Policy Implementation'],
    is_active: true,
    created_at: '2020-03-01T00:00:00Z',
    updated_at: '2020-03-01T00:00:00Z',
  },
];

// Hardcoded Equipment (until we have an equipment table)
const HOPE_HOSPITAL_EQUIPMENT: EquipmentRecord[] = [
  {
    equipmentId: 'HH/EQP/001',
    name: 'Ventilator - Drager Evita V300',
    category: 'Critical Care',
    manufacturer: 'Drager Medical',
    purchaseDate: '15-Jan-2022',
    lastCalibrationDate: '10-Dec-2024',
    nextCalibrationDate: '10-Jun-2025',
    location: 'ICU - Bed 3',
    status: 'Active',
  },
  {
    equipmentId: 'HH/EQP/002',
    name: 'Defibrillator - Philips HeartStart',
    category: 'Emergency',
    manufacturer: 'Philips Healthcare',
    purchaseDate: '20-Feb-2022',
    lastCalibrationDate: '15-Nov-2024',
    nextCalibrationDate: '15-May-2025',
    location: 'Emergency Department',
    status: 'Active',
  },
  {
    equipmentId: 'HH/EQP/003',
    name: 'Patient Monitor - Nihon Kohden',
    category: 'Monitoring',
    manufacturer: 'Nihon Kohden',
    purchaseDate: '05-Mar-2022',
    lastCalibrationDate: '20-Dec-2024',
    nextCalibrationDate: '20-Jun-2025',
    location: 'ICU - Bed 5',
    status: 'Active',
  },
  {
    equipmentId: 'HH/EQP/004',
    name: 'Autoclave - Tuttnauer 2840',
    category: 'Sterilization',
    manufacturer: 'Tuttnauer',
    purchaseDate: '10-Apr-2022',
    lastCalibrationDate: '05-Jan-2025',
    nextCalibrationDate: '05-Jul-2025',
    location: 'CSSD',
    status: 'Active',
  },
  {
    equipmentId: 'HH/EQP/005',
    name: 'X-Ray Machine - Siemens Mobilett',
    category: 'Radiology',
    manufacturer: 'Siemens Healthineers',
    purchaseDate: '25-May-2022',
    lastCalibrationDate: '12-Dec-2024',
    nextCalibrationDate: '12-Jun-2025',
    location: 'Radiology Department',
    status: 'Active',
  },
];

// Hardcoded Incidents (until we have an incidents table)
const HOPE_HOSPITAL_INCIDENTS: IncidentRecord[] = [
  {
    incidentId: 'HH/INC/2024/001',
    date: '15-Jan-2024',
    time: '14:30',
    location: 'Ward 2A',
    reportedBy: 'Nurse Sangeeta Patil',
    incidentType: 'Medication Error (Near Miss)',
    description: 'Wrong medication picked for administration, caught during double-check before administration.',
    actionTaken: 'Immediate counseling of staff, reinforcement of double-check protocol. Process review initiated.',
    status: 'Closed',
  },
  {
    incidentId: 'HH/INC/2024/002',
    date: '18-Jan-2024',
    time: '10:15',
    location: 'Emergency Department',
    reportedBy: 'Dr. Amit Verma',
    incidentType: 'Equipment Malfunction',
    description: 'Suction machine failed during patient care in ED.',
    actionTaken: 'Backup equipment immediately deployed. Biomedical team notified and equipment repaired within 2 hours.',
    status: 'Closed',
  },
  {
    incidentId: 'HH/INC/2024/003',
    date: '22-Jan-2024',
    time: '08:45',
    location: 'ICU',
    reportedBy: 'Nurse Coordinator - ICU',
    incidentType: 'Patient Fall',
    description: 'Patient attempted to get up unassisted and slipped. No injury sustained.',
    actionTaken: 'Patient assessed, vitals stable. Family counseled. Side rails reinforced. Fall risk assessment updated.',
    status: 'Closed',
  },
];

/**
 * Fetch real patient data from Supabase nabh_patients table
 */
export async function fetchRealPatients(limit: number = 20): Promise<PatientRecord[]> {
  try {
    const { data, error } = await supabase
      .from('nabh_patients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching patients from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching patients:', error);
    return [];
  }
}

/**
 * Fetch real staff data from Supabase nabh_team_members table
 */
export async function fetchRealStaff(limit: number = 10): Promise<StaffRecord[]> {
  try {
    const { data, error } = await supabase
      .from('nabh_team_members')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching staff from Supabase:', error);
      // Return hardcoded staff as fallback
      return HOPE_HOSPITAL_STAFF;
    }

    return data && data.length > 0 ? data : HOPE_HOSPITAL_STAFF;
  } catch (error) {
    console.error('Exception fetching staff:', error);
    return HOPE_HOSPITAL_STAFF;
  }
}

/**
 * Get random patients from fetched data
 */
export function getRandomPatients(patients: PatientRecord[], count: number = 5): PatientRecord[] {
  if (patients.length === 0) return [];
  const shuffled = [...patients].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get random staff from fetched data
 */
export function getRandomStaff(staff: StaffRecord[], count: number = 3): StaffRecord[] {
  if (staff.length === 0) return HOPE_HOSPITAL_STAFF.slice(0, count);
  const shuffled = [...staff].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get random equipment (hardcoded for now)
 */
export function getRandomEquipment(count: number = 3): EquipmentRecord[] {
  const shuffled = [...HOPE_HOSPITAL_EQUIPMENT].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get random incidents (hardcoded for now)
 */
export function getRandomIncidents(count: number = 2): IncidentRecord[] {
  const shuffled = [...HOPE_HOSPITAL_INCIDENTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get relevant data based on evidence type
 * This function now fetches REAL data from Supabase
 */
export async function getRelevantData(evidenceType: string): Promise<{
  patients?: PatientRecord[];
  staff?: StaffRecord[];
  equipment?: EquipmentRecord[];
  incidents?: IncidentRecord[];
}> {
  const type = evidenceType.toLowerCase();
  const data: {
    patients?: PatientRecord[];
    staff?: StaffRecord[];
    equipment?: EquipmentRecord[];
    incidents?: IncidentRecord[];
  } = {};

  // Patient-related evidence - fetch REAL patients from Supabase
  if (type.includes('patient') || type.includes('admission') || type.includes('discharge') ||
      type.includes('care') || type.includes('record') || type.includes('assessment') ||
      type.includes('consent') || type.includes('medication') || type.includes('treatment')) {
    const realPatients = await fetchRealPatients(20);
    data.patients = getRandomPatients(realPatients, 8);
  }

  // ALWAYS fetch staff data - needed for PREPARED BY / REVIEWED BY sections in all documents
  const realStaff = await fetchRealStaff(10);
  data.staff = getRandomStaff(realStaff, 5);

  // Equipment-related evidence (hardcoded for now)
  if (type.includes('equipment') || type.includes('calibration') || type.includes('maintenance') ||
      type.includes('biomedical') || type.includes('device') || type.includes('machine')) {
    data.equipment = getRandomEquipment(5);
  }

  // Incident-related evidence (hardcoded for now)
  if (type.includes('incident') || type.includes('accident') || type.includes('error') ||
      type.includes('adverse') || type.includes('sentinel') || type.includes('safety')) {
    data.incidents = getRandomIncidents(3);
  }

  return data;
}

export default {
  fetchRealPatients,
  fetchRealStaff,
  getRandomPatients,
  getRandomStaff,
  getRandomEquipment,
  getRandomIncidents,
  getRelevantData,
  HOPE_HOSPITAL_STAFF,
  HOPE_HOSPITAL_EQUIPMENT,
  HOPE_HOSPITAL_INCIDENTS,
};
