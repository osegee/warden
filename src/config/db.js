import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  ssl: {
    rejectUnauthorized: true,
  },
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Database Connected");
    client.release();
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

export { pool, connectDB };
