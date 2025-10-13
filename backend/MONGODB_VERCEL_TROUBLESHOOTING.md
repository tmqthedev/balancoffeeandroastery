# 🔧 MONGODB VERCEL DEPLOYMENT TROUBLESHOOTING

## ❌ Common Issues & Solutions

### 1. **"Database connection failed" Error**

#### Possible Causes:
- Invalid MongoDB URI
- Network connectivity issues
- Authentication problems
- Connection timeout

#### Solutions:
```bash
# Check MongoDB URI format
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Verify environment variables in Vercel dashboard
MONGODB_URI=your_complete_connection_string
```

### 2. **"MongoServerSelectionError" - Server Selection Timeout**

#### Causes:
- IP whitelist restrictions
- DNS resolution issues
- Cluster not responding

#### Solutions:
```bash
# In MongoDB Atlas:
1. Go to Network Access
2. Add IP Address: 0.0.0.0/0 (Allow access from anywhere)
3. Or add Vercel's IP ranges

# Update connection options:
serverSelectionTimeoutMS: 5000
socketTimeoutMS: 45000
```

### 3. **"Authentication Failed" Error**

#### Causes:
- Wrong username/password
- User doesn't have database permissions
- Special characters in password not URL encoded

#### Solutions:
```bash
# URL encode special characters in password
# @ → %40, # → %23, etc.

# Verify user has readWrite permissions
# In MongoDB Atlas → Database Access → Edit User
```

### 4. **"Connection Pool Exhausted" Error**

#### Causes:
- Too many concurrent connections
- Connection not being closed properly
- Serverless function limitations

#### Solutions:
```javascript
// Optimize connection pooling
const options = {
  maxPoolSize: 10,
  bufferCommands: false,
  bufferMaxEntries: 0
};
```

### 5. **Vercel Function Timeout**

#### Causes:
- Database operations taking too long
- Cold start delays
- Network latency

#### Solutions:
```json
// In vercel.json
{
  "functions": {
    "server.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

## 🛠️ Debugging Steps

### 1. **Check Environment Variables**
```bash
# In Vercel dashboard, verify:
- MONGODB_URI is set correctly
- No extra spaces or quotes
- All special characters URL encoded
```

### 2. **Test Connection Locally**
```javascript
// Add to your local server.js
console.log('MongoDB URI:', process.env.MONGODB_URI.substring(0, 20) + '...');
```

### 3. **Monitor Vercel Logs**
```bash
# Use Vercel CLI
vercel logs --follow

# Or check Vercel dashboard Functions tab
```

### 4. **Test Database Connectivity**
```bash
# Use MongoDB Compass or CLI
mongosh "mongodb+srv://your-connection-string"
```

## 🔍 Health Check Endpoint

The backend includes a health check endpoint at `/health`:

```json
GET /health

Response:
{
  "status": "healthy",
  "database": {
    "connected": true,
    "state": 1,
    "host": "cluster.mongodb.net",
    "name": "balancoffee"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📊 MongoDB Atlas Configuration

### 1. **Network Access**
```
IP Address: 0.0.0.0/0
Comment: Vercel deployment
```

### 2. **Database User**
```
Username: your_username
Password: secure_password
Database User Privileges: Read and write to any database
```

### 3. **Connection String**
```
mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
```

## 🚀 Optimizations for Vercel

### 1. **Connection Caching**
```javascript
// Reuse connections across function invocations
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }
  
  cachedConnection = await mongoose.connect(uri, options);
  return cachedConnection;
};
```

### 2. **Connection Options**
```javascript
const options = {
  bufferCommands: false,    // Disable buffering
  bufferMaxEntries: 0,     // Disable buffering
  maxPoolSize: 10,         // Connection pool size
  serverSelectionTimeoutMS: 5000,  // Timeout
  socketTimeoutMS: 45000,  // Socket timeout
  family: 4               // IPv4 only
};
```

### 3. **Error Handling**
```javascript
// Implement retry logic
const connectWithRetry = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await connectDB();
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created with proper permissions
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Connection string tested locally
- [ ] Environment variables set in Vercel
- [ ] Vercel function memory increased to 1024MB
- [ ] Health check endpoint tested
- [ ] Error handling middleware implemented

## 🆘 Emergency Debugging

If all else fails:

1. **Check Vercel function logs**
2. **Test connection with MongoDB Compass**  
3. **Verify Atlas cluster status**
4. **Check network connectivity**
5. **Review environment variable values**
6. **Try a fresh MongoDB Atlas cluster**

---

*For additional support, check MongoDB Atlas documentation or Vercel support.*