import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

const dbName = process.env.MONGODB_DB_NAME || "mern-220";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();
    
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'agent', 'attendee'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const clientPromise = await getClientPromise();
    const client = await clientPromise;
    const db = client.db(dbName);

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'agent') {
      // Create a pending agent application
      await db.collection("agentApplications").insertOne({
        name,
        email,
        password: hashedPassword,
        status: 'pending',
        createdAt: new Date()
      });
      return NextResponse.json({ message: 'Agent application submitted for review' }, { status: 201 });
    } else {
      // Insert new user for attendees
      const result = await db.collection("users").insertOne({
        name,
        email,
        password: hashedPassword,
        role,
        createdAt: new Date()
      });
      return NextResponse.json({ message: 'User created successfully', userId: result.insertedId }, { status: 201 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
