import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { withAuth } from '@/middleware/authMiddleware';

const ADMIN_CREATE_CODE = process.env.ADMIN_CREATE_CODE || 'your_secure_admin_code';

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { name, email, password, adminCode } = await req.json();
    
    if (!name || !email || !password || !adminCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (adminCode !== ADMIN_CREATE_CODE) {
      return NextResponse.json({ error: 'Invalid admin code' }, { status: 403 });
    }

    const clientPromise = await getClientPromise();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });

    return NextResponse.json({ message: 'Admin created successfully', userId: result.insertedId }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}

export const POST = withAuth(handler, ['admin']);
