export type UserRole = 'ORG_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organization_id: number;
  organization_name: string;
  department_id: number | null;
}
