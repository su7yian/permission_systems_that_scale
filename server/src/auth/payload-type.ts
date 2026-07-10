import { UserRole } from '../generated/prisma/enums';

export interface PayloadType {
  id: string;
  email: string;
  role: UserRole;
  department: string;
  jti: string;
}