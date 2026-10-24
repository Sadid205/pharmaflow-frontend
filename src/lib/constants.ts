export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PHARMACY_OWNER: 'PHARMACY_OWNER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const MEDICINE_CATEGORIES = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Injection',
  'Ointment',
  'Drops',
  'Inhaler',
  'Suspension',
  'Gel',
  'Suppository',
] as const;

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;
export const DEFAULT_EXPIRING_DAYS = 30;
