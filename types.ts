export enum CarStatus {
  Available = 'Available',
  Rented = 'Rented',
  Maintenance = 'Maintenance',
}

export enum UserRole {
    Admin = 'Admin',
    Employee = 'Employee',
}

export interface User {
    id: string;
    name: string;
    role: UserRole;
    password?: string; // Should be handled securely on a real backend
}

export interface CustomerDocument {
  id: string;
  name: string;
  fileUrl: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    nationalId: string;
    documents: CustomerDocument[];
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  cost: number;
}

export interface DocumentRecord {
  id: string;
  name: string;
  expiryDate: string;
  fileUrl: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  engineCapacity: string;
  fuelType: string;
  status: CarStatus;
  imageUrl: string;
  maintenanceHistory: MaintenanceRecord[];
  documents: DocumentRecord[];
  pricePerDay: number;
  nextServiceDate?: string;
  description?: string;
}

export interface DamagePoint {
    id: string;
    part: string; // e.g., 'front-bumper', 'windshield'
    description: string;
    photoUrl?: string;
}

export interface CheckState {
    damages: DamagePoint[];
    checklist: {
        [key: string]: boolean | string; // e.g., 'cleanliness_interior': 'Good'
    };
    fuelLevel: number; // 0 to 100
    mileage: number;
    notes: string;
    signatureUrl?: string; // Data URL of signature
    timestamp: string;
}

export interface ExtraFee {
    id: string;
    description: string;
    amount: number;
}

export interface Booking {
  id: string;
  carId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  isNew?: boolean;
  checkOutState?: CheckState;
  checkInState?: CheckState;
  extraFees?: ExtraFee[];
}

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense',
}

export enum TransactionCategory {
    Rental = 'Rental',
    Maintenance = 'Maintenance',
    Fuel = 'Fuel',
    Insurance = 'Insurance',
    Salaries = 'Salaries',
    Rent = 'Rent',
    ExtraFee = 'ExtraFee',
    Other = 'Other',
}


export interface Transaction {
  id:string;
  type: TransactionType;
  category: TransactionCategory | string;
  description: string;
  amount: number;
  date: string;
  carId?: string;
  bookingId?: string;
}

export enum NotificationType {
    Document = 'Document',
    Maintenance = 'Maintenance',
    Booking = 'Booking',
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    date: string;
    isRead: boolean;
    linkTo?: string;
}

export interface Season {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    multiplier: number;
}
