import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: 'user' | 'admin'; collegeId?: string };
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

export function authUser(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.role !== 'user') return res.status(403).json({ error: 'Forbidden' });
    req.user = { id: payload.id, role: 'user', collegeId: payload.collegeId };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function authAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.user = { id: payload.id, role: 'admin', collegeId: payload.collegeId };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function signToken(payload: { id: string; role: 'user' | 'admin'; collegeId?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}


