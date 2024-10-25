import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "mern-220");

    // Perform a simple query to test the connection
    const collection = db.collection("test");
    const result = await collection.find({}).limit(1).toArray();

    res
      .status(200)
      .json({ message: "Successfully connected to MongoDB", data: result });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Error connecting to the database", error: e.message });
  }
}
