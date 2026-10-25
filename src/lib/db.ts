import clientPromise from "./mongodb";

export async function getDatabase() {
  const client = await clientPromise;

  return client.db("inkstoneDB");
}   