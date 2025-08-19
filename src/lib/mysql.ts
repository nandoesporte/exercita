import mysql from 'mysql2/promise';

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'gym_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to execute queries
export async function executeQuery<T = any>(
  query: string,
  values: any[] = []
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, values);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute single row queries
export async function executeQuerySingle<T = any>(
  query: string,
  values: any[] = []
): Promise<T | null> {
  const results = await executeQuery<T>(query, values);
  return results.length > 0 ? results[0] : null;
}

// Helper function to execute insert queries and return inserted ID
export async function executeInsert(
  query: string,
  values: any[] = []
): Promise<number> {
  try {
    const [result] = await pool.execute(query, values);
    return (result as any).insertId;
  } catch (error) {
    console.error('Database insert error:', error);
    throw error;
  }
}

// Helper function to execute update/delete queries and return affected rows
export async function executeUpdate(
  query: string,
  values: any[] = []
): Promise<number> {
  try {
    const [result] = await pool.execute(query, values);
    return (result as any).affectedRows;
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
}

export default pool;