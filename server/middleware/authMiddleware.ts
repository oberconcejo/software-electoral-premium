import { Request, Response, NextFunction } from 'express';
import { db } from '../../src/db';
import { profiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/express';

export interface AuthenticatedRequest extends Request {
  user?: any;
  clientId?: string | null;
  auth?: any; // Añadido por Clerk
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Clerk ya procesó el token y pobló req.auth si usamos clerkMiddleware en server.ts
  if (!req.auth || !req.auth.userId) {
    req.user = null;
    req.clientId = null;
    return next();
  }

  try {
    const clerkId = req.auth.userId;

    // Buscar en Drizzle ORM
    const userProfile = await db.select().from(profiles).where(eq(profiles.clerkId, clerkId)).limit(1);

    if (userProfile.length > 0) {
      const profile = userProfile[0];
      req.user = { id: profile.id, role: profile.role, clerkId: profile.clerkId };
      req.clientId = profile.clientId || null;
    } else {
      req.user = { id: clerkId, role: 'NUEVO_USUARIO' };
      req.clientId = null;
    }
  } catch (err) {
    console.error('Authentication middleware Drizzle lookup failed:', err);
    req.user = null;
    req.clientId = null;
  }
  next();
};
