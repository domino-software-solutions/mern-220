import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export function withAuth(
  handler: (req: NextRequest) => Promise<Response>,
  allowedRoles: string[] = []
) {
  return async (req: NextRequest) => {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      return handler(req);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  };
}
