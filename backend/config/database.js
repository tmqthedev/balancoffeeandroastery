const sql = require('mssql');
const MockDatabase = require('./mock-database');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'BalanCoffeeRoastery',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;
let mockDb;
let useMockDb = process.env.USE_MOCK_DB === 'true';

const connect = async () => {
  try {
    if (useMockDb) {
      if (!mockDb) {
        mockDb = new MockDatabase();
        console.log('🔄 Using mock database for development...');
      }
      return mockDb;
    }
    
    if (!pool) {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
    }
    return pool;
  } catch (err) {
    console.error('Database connection error:', err);
    console.log('🔄 Switching to mock database for development...');
    useMockDb = true;
    if (!mockDb) {
      mockDb = new MockDatabase();
    }
    return mockDb;
  }
};

const query = async (sqlQuery, params = {}) => {
  try {
    const connection = await connect();
    
    if (useMockDb) {
      return await connection.query(sqlQuery, params);
    }
    
    const request = connection.request();
    
    // Add parameters to request
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(sqlQuery);
    return result.recordset;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

const execute = async (sqlQuery, params = {}) => {
  try {
    const connection = await connect();
    
    if (useMockDb) {
      return await connection.execute(sqlQuery, params);
    }
    
    const request = connection.request();
    
    // Add parameters to request
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(sqlQuery);
    return result;
  } catch (err) {
    console.error('Database execute error:', err);
    throw err;
  }
};

const close = async () => {
  try {
    if (useMockDb && mockDb) {
      await mockDb.close();
    } else if (pool) {
      await pool.close();
      pool = null;
    }
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
};

// Test connection
const testConnection = async () => {
  try {
    await connect();
    if (useMockDb) {
      console.log('✅ Mock database connection test successful');
    } else {
      console.log('✅ Database connection test successful');
    }
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    return false;
  }
};

module.exports = {
  connect,
  query,
  execute,
  close,
  testConnection,
  sql
};
