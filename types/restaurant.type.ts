export interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  source: string;
  rating: number;
  reviewCount: number;
  leadActivity: LeadActivity[];
  leadNotes: LeadNote[];
  leadStatus: LeadStatus;
  company: Company;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string[];
}

export interface LeadActivity {
  id: string;
  type: string;
  activity: string;
  description: string;
  createdAt: Date;
  user: LeadStatus;
}

export interface LeadStatus {
  id: string;
  name: string;
}

export interface LeadNote {
  id: string;
  notes: string;
  createdAt: Date;
  user: LeadStatus;
}
