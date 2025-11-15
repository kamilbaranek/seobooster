import { UserRole, WebStatus } from '@prisma/client';

export interface AuthenticatedUserPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    webs: Array<{
      id: string;
      url: string;
      status: WebStatus;
    }>;
  };
}
