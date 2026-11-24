export type DesignCategory =
  | 'wedding'
  | 'id-cards'
  | 'posters'
  | 'business'
  | 'social'
  | 'certificates'
  | 'menus'
  | 'photo-studio';

export type TemplateSubcategory =
  // Wedding
  | 'hindu-wedding'
  | 'muslim-wedding'
  | 'sikh-wedding'
  | 'christian-wedding'
  | 'rajasthani-royal'
  | 'south-indian'
  | 'haldi'
  | 'mehndi'
  | 'reception'
  | 'save-the-date'
  // ID Cards
  | 'school-id'
  | 'college-id'
  | 'employee-id'
  | 'hospital-id'
  | 'visitor-pass'
  | 'library-id'
  // Posters
  | 'festival-poster'
  | 'political-campaign'
  | 'coaching-institute'
  | 'business-advertisement'
  | 'restaurant-offer'
  // Business
  | 'visiting-card'
  | 'letterhead'
  | 'invoice-bill'
  | 'restaurant-menu'
  | 'certificate'
  | 'product-label';

export interface CanvasDimensions {
  width: number;
  height: number;
  name: string;
  unit?: string;
  dpi?: number;
}

export interface DesignProject {
  id: string;
  title: string;
  category: DesignCategory;
  subcategory?: string;
  width: number;
  height: number;
  pages: {
    id: string;
    name: string;
    canvasData: any; // Fabric JSON representation
    previewThumbnail?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  tags?: string[];
}

export interface DesignTemplate {
  id: string;
  title: string;
  category: DesignCategory;
  subcategory: TemplateSubcategory;
  width: number;
  height: number;
  isPremium: boolean;
  thumbnail: string;
  language: 'Hindi' | 'English' | 'Bilingual' | 'Regional';
  tags: string[];
  canvasData: any; // Fabric canvas serialized JSON or preset definition
  description?: string;
}

export interface WeddingFormData {
  groomName: string;
  brideName: string;
  groomParents: string;
  brideParents: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl?: string;
  rsvpNames: string;
  rsvpPhone: string;
  subType: 'hindu' | 'muslim' | 'sikh' | 'christian' | 'rajasthani' | 'haldi' | 'mehndi' | 'reception';
  shlokaOrBismillah?: string;
  language: 'Hindi' | 'English';
}

export interface IDCardData {
  id: string;
  fullName: string;
  designationOrClass: string;
  idNumber: string;
  departmentOrSection: string;
  bloodGroup: string;
  dob: string;
  contactNumber: string;
  photoUrl?: string;
  organizationName: string;
  validUpto: string;
  emergencyContact: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  plan: 'free' | 'starter' | 'pro' | 'business';
  aiCredits: number;
  createdAt: string;
}
