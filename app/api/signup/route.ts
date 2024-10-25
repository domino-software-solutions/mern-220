import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';

const dbName = process.env.MONGODB_DB_NAME || "mern-220";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const clientPromise = await getClientPromise();
    const client = await clientPromise;
    const db = client.db(dbName);

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });

    // Insert user into database
    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: 'User created successfully', userId: result.insertedId }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
