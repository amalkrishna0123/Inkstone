import { getMongoClientPromise } from "./mongodb";

export async function getDatabase() {
  const client = await getMongoClientPromise();

  return client.db("inkstoneDB");
}   