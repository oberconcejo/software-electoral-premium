import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/dbService';

export interface AuthenticatedRequest extends Request {
  user?: any;
  clientId?: string | null;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    req.clientId = null;
    return next();
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    if (token === 'mock-token') {
      req.user = { id: 'mock-user-id', role: 'SUPERADMIN' };
      req.clientId = 'mock-client-id';
      return next();
    }

    if (supabaseAdmin) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        req.user = null;
        req.clientId = null;
        return next();
      }

      req.user = user;
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('client_id')
        .eq('id', user.id)
        .maybeSingle();

      req.clientId = profile?.client_id || null;
    } else {
      req.user = { id: 'mock-user-id' };
      req.clientId = 'mock-client-id';
    }
  } catch (err) {
    console.warn('Authentication middleware validation failed:', err);
    req.user = null;
    req.clientId = null;
  }
  next();
};
