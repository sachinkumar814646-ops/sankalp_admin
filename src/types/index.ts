export interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  language: "Hindi" | "English" | "Punjabi";
  status: "active" | "disabled";
  joinedAt: string;
  sankalpCount: number;
  orderCount: number;
}

export interface Naam {
  id: number;
  name: string;
  name_hindi: string;
  slug: string;
  description?: string;
  category: string;
  icon?: string;
  status: "active" | "inactive";
  sort_order: number;
  createdAt: string;
}

export interface DesignTemplates {
  cover: string | null;
  writingPage: string | null;
  milestonePage: string | null;
  completionPage: string | null;
}

export interface Design {
  id: number;
  name: string;
  type: "simple" | "traditional" | "premium";
  description: string;
  status: "active" | "inactive";
  usageCount: number;
  createdAt: string;
  templates: DesignTemplates;
  theme?: string;
}

export interface SankalpCalendarDay {
  date: string;
  count: number;
  dailyTarget: number;
  completed: boolean;
}

export interface Sankalp {
  id: number;
  userId: number;
  naamId: number;
  designId: number;
  recipientType: "Myself" | "Mother" | "Father" | "Family" | "Someone Special";
  recipientName: string;
  intention: string;
  targetCount: 1008 | 5000 | 11000 | 21000 | 51000 | 100000;
  completedCount: number;
  status: "active" | "completed" | "paused";
  startDate: string;
  completionDate?: string;
  currentStreak: number;
  longestStreak: number;
  dailyAverage: number;
  lastWrittenAt: string;
  pauseReason?: string;
  user?: User;
  naam?: Naam;
  design?: Design;
}

export interface Personalization {
  id: number;
  orderNumber: string;
  userId: number;
  naamId: number;
  designId: number;
  sankalpId?: number;
  targetCount: 1008 | 5000 | 11000 | 21000 | 51000 | 100000;
  recipientName: string;
  recipientRelation: "Maa" | "Papa" | "Dadi" | "Nani" | "Family" | "Myself" | "Someone Special";
  fromName: string;
  dedication: string;
  language: "Hindi" | "English";
  bookSize: "A5" | "A4 Large Print";
  binding: "Perfect" | "Wiro";
  edition: "Standard" | "Premium Gift";
  dateText?: string;
  familyName?: string;
  approvalStatus: "pending" | "approved" | "changes_requested";
  approvalNote?: string;
  previewFile?: string;
  finalPdf?: string;
  pages: number;
  createdAt: string;
  user?: User;
  naam?: Naam;
  design?: Design;
}
export interface Notification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Product {
  id: number;
  name: string;
  naamId: number;
  targetCount: 1008 | 5000 | 11000 | 21000 | 51000 | 100000;
  bookSize: "A5" | "A4 Large Print";
  binding: "Perfect" | "Wiro";
  edition: "Standard" | "Premium Gift";
  pages: number;
  basePrice: number;
  shippingFee: number;
  status: "active" | "inactive";
  createdAt: string;
  naam?: { id: number; name: string; icon?: string };
}
