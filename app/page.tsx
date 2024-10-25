import { getClientPromise } from '../lib/mongodb';
import Link from 'next/link';

const dbName = process.env.MONGODB_DB_NAME || "mern-220";

// Add this function to fetch users
async function getUsers() {
  try {
    const clientPromise = await getClientPromise();
    const client = await clientPromise;
    const db = client.db(dbName);
    const users = await db.collection("users").find({}).toArray();
    return users;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to fetch users');
  }
}

// Export a React component as the default export
export default async function Home() {
  const users = await getUsers();
  
  return (
    <div>
      <h1>Users</h1>
      <Link href="/signup">Sign Up</Link>
      <ul>
        {users.map((user: User) => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

interface User {
  _id: string;
  name: string;
}
