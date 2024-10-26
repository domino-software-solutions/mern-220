import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error("Failed to connect to MongoDB:", err);
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  });
}

// Export a module-scoped MongoClient promise
export const getClientPromise = async () => {
  if (!clientPromise) {
    throw new Error("MongoDB client promise not initialized");
  }
  try {
    const client = await clientPromise;
    // Remove the unused db declaration
    // const db = client.db(process.env.MONGODB_DB_NAME || "mern-220");
    return client;
  } catch (error) {
    console.error("Error in getClientPromise:", error);
    throw error;
  }
};

// Add a new function to get the database if needed
export const getDatabase = async () => {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB_NAME || "mern-220");
};
