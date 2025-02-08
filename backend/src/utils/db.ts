import { PrismaClient } from '@prisma/client';

// Create a Prisma client instance
const prisma = new PrismaClient();

// Function to test the database connection
const connectToDB = async () => {
  try {
    // Run a basic query to check if the connection is working
    await prisma.$queryRaw`SELECT 1`;
    console.log('Connected to the database successfully');
  } catch (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
};

export default prisma;
export { connectToDB };
