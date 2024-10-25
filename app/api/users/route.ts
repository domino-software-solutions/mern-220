import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  createdAt: Date;
}

const dbName = process.env.MONGODB_DB_NAME || "mern-220";

export async function GET() {
  try {
    const clientPromise = await getClientPromise();
    const client = await clientPromise;
    const db = client.db(dbName);
    const users = await db.collection("users").find({}).toArray() as User[];
    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientPromise = await getClientPromise();
    const client = await clientPromise;
    const db = client.db(dbName);
    const { name, email }: Partial<User> = await request.json();
    
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const newUser: User = {
      name,
      email,
      createdAt: new Date()
    };

    const result = await db.collection("users").insertOne(newUser);
    return NextResponse.json({ ...newUser, _id: result.insertedId }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
