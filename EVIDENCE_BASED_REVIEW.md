# Evidence-Based Repository Review: Balan Coffee & Roastery

**Review Date:** 2026-08-14  
**Branch:** aws-workshop-v2  
**Reviewer Methodology:** Evidence-first (no assumptions)

---

## EXECUTIVE SUMMARY

This is a **dual-deployment architecture** project supporting both:
1. **Vercel Serverless Functions** (via `vercel.json`)
2. **Docker Compose on EC2** (via `docker-compose.yml` and architecture docs)

The application has **recently migrated from MongoDB to PostgreSQL**, creating **mixed-mode code** where:
- Database layer is PostgreSQL (in production)
- Some middleware/utilities still reference MongoDB (legacy, not actively used)
- Application maintains backward compatibility with MongoDB-shaped API responses

**Critical Finding:** There is **NO SSM Session Manager tunnel implementation** in the codebase. AWS connectivity relies on:
- EC2 IAM roles (in EC2 deployment)
- Explicit AWS credentials via `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` environment variables
- Optional fallback to AWS Secrets Manager for database credentials

---

## SECTION 1: CONFIRMED ARCHITECTURE

### Deployment Options (Both Supported)

| Aspect | Vercel Serverless | EC2 + Docker Compose |
|--------|-------------------|----------------------|
| **Trigger** | `process.env.VERCEL` set | `process.env.VERCEL` NOT set |
| **Startup Mode** | Pre-connect to DB, export app | Listen on PORT, HTTP server |
| **Database** | External (RDS/Postgres required) | External (RDS/Postgres required) |
| **Frontend** | Built static (Vite) → Vercel | Built static → nginx in Docker |
| **Backend** | Node function handler | Express HTTP server |
| **File Path** | `vercel.json` | `docker-compose.yml` |

**Evidence:**
- [backend/server.js](backend/server.js#L451-L489): Checks `if (process.env.VERCEL)` to determine runtime mode
- [vercel.json](vercel.json): Frontend uses `@vercel/static-build`, backend uses `@vercel/node`
- [docker-compose.yml](docker-compose.yml): Defines frontend (nginx) and backend (node) services
- [Dockerfile](Dockerfile) (frontend): Multi-stage nginx build
- [backend/Dockerfile](backend/Dockerfile): Node.js application container

---

## SECTION 2: CONFIRMED DATABASE CONNECTIVITY FLOW

### Trace: Database Connection Path

```
server.js (requires dotenv)
    ↓
    dotenv.config()  [loads .env file if present]
    ↓
getRuntimeConfig()  [backend/config/runtimeConfig.js]
    ↓
    isProduction = NODE_ENV === 'production' || !!VERCEL
    ↓
IF production:
    Try: Secrets Manager → DATABASE_SECRET_ID → POSTGRES_URI
IF NOT production OR Secrets Manager fails:
    Fallback: POSTGRES_URI from environment variable
    ↓
postgresUri: databaseSecret.POSTGRES_URI || process.env.POSTGRES_URI
    ↓
getPostgresPool() → new Pool({ connectionString: postgresUri, ... })
    ↓
pg module (standard PostgreSQL library)
    ↓
PostgreSQL database (RDS or direct connection)
```

**Evidence Files:**

| Step | File | Evidence |
|------|------|----------|
| Entry | [backend/server.js](backend/server.js#L11) | `require('dotenv').config()` |
| Runtime Config Load | [backend/server.js](backend/server.js#L136) | `await getRuntimeConfig()` in connectToDatabase() |
| Secret Loading Decision | [backend/config/runtimeConfig.js](backend/config/runtimeConfig.js#L4) | `isProduction = process.env.NODE_ENV === 'production' \|\| !!process.env.VERCEL` |
| Secrets Manager Attempt | [backend/config/runtimeConfig.js](backend/config/runtimeConfig.js#L72-77) | `await loadSecretWithLogging('DATABASE_SECRET_ID', databaseSecretId, 'Database')` |
| Fallback Handler | [backend/config/runtimeConfig.js](backend/config/runtimeConfig.js#L78-81) | `if (isProduction) { throw error; } else { logger.warn(...); }` |
| URI Resolution | [backend/config/runtimeConfig.js](backend/config/runtimeConfig.js#L90) | `postgresUri: databaseSecret.POSTGRES_URI \|\| process.env.POSTGRES_URI` |
| Connection Pool | [backend/config/postgres.js](backend/config/postgres.js#L32-41) | `new Pool({ connectionString: normalizePostgresConnectionString(config.postgresUri), ssl: getPostgresSslConfig(), ... })` |
| pg library | [backend/package.json](backend/package.json#L20) | `"pg": "^8.22.0"` dependency |

---

## SECTION 3: DEVELOPMENT MODE (VERIFIED)

### Actual Development Mode Behavior

**Condition:** `NODE_ENV !== 'production'` AND `VERCEL` not set

**What Changes Between Development & Production:**

| Aspect | Development | Production |
|--------|-------------|------------|
| **Startup** | Listens on HTTP server | Exports app for Vercel serverless |
| **Port** | PORT env var (default 5000) | N/A (serverless) |
| **Rate Limiter** | **DISABLED** | **ENABLED** |
| **Secrets Manager** | Optional (fails gracefully) | **REQUIRED** (errors exit process) |
| **Error Responses** | Full error details in JSON | Generic "Internal server error" |
| **SSL Cookie** | `AUTH_COOKIE_SECURE=false` (default) | `AUTH_COOKIE_SECURE=true` |
| **Pool Size** | 10 connections | 5 connections |
| **Required Secrets** | Only `postgresUri` | All secrets required |

**Evidence:**

| Feature | File | Line | Evidence |
|---------|------|------|----------|
| Rate Limiter | [backend/server.js](backend/server.js#L93-96) | 93-96 | `if (process.env.NODE_ENV === 'development') { logger.info('Rate limiter disabled'); } else { app.use('/api/', limiter); }` |
| Error Detail | [backend/server.js](backend/server.js#L335) | 335 | `error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'` |
| Pool Size | [backend/config/postgres.js](backend/config/postgres.js#L38) | 38 | `max: process.env.NODE_ENV === 'production' ? 5 : 10` |
| Secrets Requirement | [backend/config/runtimeConfig.js](backend/config/runtimeConfig.js#L119-125) | 119-125 | `if (isProduction) { requireValue(config, ...); }` |
| Development Startup | [backend/server.js](backend/server.js#L469-488) | 469-488 | Full development mode flow |

### Database in Development Mode

**Does development use `.env`?** YES
**Does development attempt AWS Secrets Manager?** YES (optional, fails gracefully)
**What happens if Secrets Manager unavailable?** Logs warning, continues with .env values
**Database type:** PostgreSQL (same as production)
**Database location:** External (RDS or direct connection via POSTGRES_URI)
**Is database local?** NO - designed for external PostgreSQL instance

**Evidence:**
- [backend/.env.example](backend/.env.example#L14): `POSTGRES_URI=postgresql://<username>:<password>@<rds-endpoint>:5432/balancoffee?sslmode=no-verify`
- [backend/config/runtimeConfig.js](backend/config/runtimeConfig.js#L78-81): Fallback to .env on Secrets Manager failure

---

## SECTION 4: DOCKER / DOCKER COMPOSE CONFIGURATION

### Services Defined

**File:** [docker-compose.yml](docker-compose.yml)

| Service | Image Source | Port Mapping | NODE_ENV | Network |
|---------|--------------|--------------|----------|---------|
| **frontend** | `./Dockerfile` (nginx) | `80:80` | N/A | docker (backend service discovery) |
| **backend** | `./backend/Dockerfile` | `5000:5000` | **hardcoded: production** | docker (nginx service discovery) |

### Critical Finding: NODE_ENV in Docker

**In docker-compose.yml (line 19):**
```yaml
environment:
  NODE_ENV: production
```

**This is hardcoded to `production`.** This means:
- Rate limiter is **ENABLED** in Docker
- All secrets **REQUIRED** (will fail if missing)
- Error responses are **minimal** (no details leaked)
- Pool size is **5** (production-optimized)

### Network Communication (Docker Internal)

```
Client (HTTP)
    ↓
CloudFront (CDN layer - external)
    ↓
nginx (port 80)
    ├─ Static files: /usr/share/nginx/html
    ├─ Proxies /api/ → http://backend:5000  [Docker DNS]
    ├─ Proxies /health → http://backend:5000/health
    └─ Proxies /uploads/ → http://backend:5000
    
backend (port 5000, Docker internal)
    ├─ Connects to RDS PostgreSQL (external)
    ├─ Connects to S3 (external)
    ├─ Connects to Cognito (external)
    └─ Connects to Secrets Manager (external)
```

**Evidence:**
- [nginx/default.conf](nginx/default.conf#L19): `proxy_pass http://backend:5000;`
- `http://backend:5000` works only in Docker network (Docker DNS resolves service name)
- No IAM authentication for RDS (connection uses username/password)

### Environment File Loading

**docker-compose.yml line 16:**
```yaml
env_file:
  - ./backend/.env
```

Loads from `./backend/.env` **if it exists**. But `.env` is `.gitignore`'d, so in practice:
- File not in git
- Must be created manually before docker-compose up
- Can be overridden with `environment:` section

---

## SECTION 5: AWS SERVICES & CREDENTIALS

### AWS SDK Usage in Backend

**File:** [backend/package.json](backend/package.json#L10-15)

```
"@aws-sdk/client-bedrock-runtime": "^3.1102.0"
"@aws-sdk/client-s3": "^3.1102.0"
"@aws-sdk/client-cognito-identity-provider": "^3.1101.0"
"@aws-sdk/client-secrets-manager": "^3.1101.0"
"aws-jwt-verify": "^5.2.1"
```

### Credential Sources

**For Bedrock (AI Recommendations):**  
[backend/services/bedrockService.js](backend/services/bedrockService.js#L17-26):
```javascript
const credentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  : undefined;  // Falls back to default credentials (IAM role)

const bedrockClient = new BedrockRuntimeClient({
  region,
  ...(credentials ? { credentials } : {}),  // Only pass if explicitly provided
});
```

**For S3 (Image Upload):**  
[backend/services/imageService.js](backend/services/imageService.js#L9-18):
Same pattern - explicit credentials if provided, otherwise IAM role

**For Secrets Manager:**  
[backend/config/runtimeConfig.js](backend/config/runtimeConfig.js#L6):
```javascript
const secretsClient = new SecretsManagerClient({ region });
```
Uses default AWS SDK credential chain (EC2 IAM role or explicit credentials)

### Credential Chain (AWS SDK Default)

When credentials not explicitly passed:

1. `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` env vars
2. `AWS_PROFILE` (named profile in ~/.aws/credentials)
3. EC2 IAM instance role (if running on EC2)
4. ECS task role (if running in ECS)
5. Cognito identity (if configured)

**In This Project:**
- EC2 deployment: Uses EC2 IAM role (recommended)
- Vercel deployment: Uses explicit environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- Local development: Must provide explicit credentials or IAM role

---

## SECTION 6: SECRETS MANAGEMENT

### Configuration

**File:** [backend/config/runtimeConfig.js](backend/config/runtimeConfig.js#L60-77)

```javascript
const databaseSecretId = process.env.DATABASE_SECRET_ID;
const smtpSecretId = process.env.SMTP_SECRET_ID;
const cognitoSecretId = process.env.COGNITO_SECRET_ID;
const authSecretId = process.env.AUTH_SECRET_ID;

// Loads in parallel
[databaseSecret, smtpSecret, cognitoSecret, authSecret] = await Promise.all([
  loadSecretWithLogging('DATABASE_SECRET_ID', databaseSecretId, 'Database'),
  loadSecretWithLogging('SMTP_SECRET_ID', smtpSecretId, 'SMTP'),
  loadSecretWithLogging('COGNITO_SECRET_ID', cognitoSecretId, 'Cognito'),
  loadSecretWithLogging('AUTH_SECRET_ID', authSecretId, 'Auth')
]);
```

### Fallback Behavior

**Line 78-81:**
```javascript
} catch (error) {
  if (isProduction) {
    throw error;  // FAIL in production
  }
  logger.warn('AWS Secrets Manager unavailable; falling back to .env config:', error.message);
}
```

| Environment | Secrets Manager Unavailable | Behavior |
|-------------|---------------------------|----------|
| **Production** | Yes | **FATAL** - Process exits (throws error) |
| **Development** | Yes | **OK** - Logs warning, uses .env values |

### Expected Secrets in Secrets Manager

| Secret ID | Contents | Required In |
|-----------|----------|-------------|
| DATABASE_SECRET_ID | `{ POSTGRES_URI: "..." }` | Production |
| SMTP_SECRET_ID | `{ EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM }` | Production |
| COGNITO_SECRET_ID | `{ COGNITO_CLIENT_SECRET: "..." }` | Production (Cognito login) |
| AUTH_SECRET_ID | `{ JWT_SECRET, SESSION_SECRET }` | Production |

**Example .env.example:** [backend/.env.example](backend/.env.example#L42-46)

---

## SECTION 7: SSM SESSION MANAGER ANALYSIS

### Repository Search Results

**Query:** `ssm|session.manager|port.forward|bastion|tunnel|localhost:5432`

**Result:** **NO MATCHES** in application code

**Grep Results:** [backend/config/authCookies.js](backend/config/authCookies.js#L20) - only cookie `maxAge` field (false positive)

### Repository Search for StartSession / SendCommand

**Query:** `StartSession|TerminateSession|SendCommand|port.forward|rds.proxy|iam.auth`

**Result:** **NO MATCHES** in entire codebase

### Documentation Check

**Files:** `docs/*.md`

**Search:** IAM role, VPC, private subnet, RDS, bastion, SSM

**Findings:**
- [docs/01-solution-design-document.md](docs/01-solution-design-document.md#L196): Mentions "IAM Role" and "Private database subnet"
- [docs/02-solution-architecture.md](docs/02-solution-architecture.md#L332): "Private database subnet"
- **NO mention of SSM Session Manager**
- **NO mention of port forwarding**
- **NO mention of bastion host**

### Official Conclusion

**SSM Session Manager Tunnel: NOT IMPLEMENTED IN THIS PROJECT**

**Evidence supporting this conclusion:**
1. No AWS SDK calls to SSM API
2. No documentation of SSM/tunnel setup
3. No configuration for port forwarding
4. Connection string uses direct hostname + credentials
5. No localhost:5432 references

---

## SECTION 8: DATABASE CONNECTIVITY IN PRODUCTION (EC2)

### Network Path: Laptop → EC2 → RDS

```
[IMPORTANT: This assumes standard AWS setup, NOT proven by repository]

Developer Laptop
    ↓ (SSH or Vercel dashboard)
EC2 Instance [IAM role: RDS access]
    ↓ (VPC private route)
RDS PostgreSQL (private endpoint)
```

### How Application Inside EC2 Reaches RDS

**From backend/config/runtimeConfig.js line 90:**
```javascript
postgresUri: databaseSecret.POSTGRES_URI || process.env.POSTGRES_URI
```

Example value from [backend/.env.example](backend/.env.example#L14):
```
postgresql://<username>:<password>@<rds-endpoint>:5432/balancoffee?sslmode=no-verify
```

### Credential Methods for RDS Connection

**Method 1: Username/Password (Currently Used)**
- Credentials stored in AWS Secrets Manager
- Application retrieves at startup
- Passed in connection string
- Simple, traditional approach

**Method 2: IAM Database Authentication (NOT Used)**
- Would require `@aws-sdk/rds-signer`
- Would generate temporary tokens
- Would require additional IAM policy
- **NOT implemented** - no IAM auth code found

### SSL Configuration

**[backend/config/postgres.js](backend/config/postgres.js#L24-29):**
```javascript
function getPostgresSslConfig() {
  const sslMode = process.env.POSTGRES_SSLMODE || 'no-verify';

  if (sslMode === 'disable') {
    return false;
  }

  return {
    rejectUnauthorized: sslMode !== 'no-verify'
  };
}
```

- Default: `sslmode=no-verify` (allow self-signed certificates)
- Environment: Can override with `POSTGRES_SSLMODE`
- **In .env.example:** `POSTGRES_SSLMODE=no-verify`

**Security Note:** `no-verify` should be reviewed for production RDS (ideally use `verify-full`)

---

## SECTION 9: VERCEL DEPLOYMENT

### Vercel Configuration

**File:** [vercel.json](vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/server.js" },
    { "src": "/health", "dest": "/backend/server.js" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Vercel Deployment Mode

**Trigger:** `process.env.VERCEL` set automatically by Vercel platform

**Startup Behavior:** [backend/server.js](backend/server.js#L451-468)
```javascript
if (process.env.VERCEL) {
  logger.info('🏭 Backend: PRODUCTION MODE - Vercel Serverless Functions');
  logger.info('⚡ Backend: Pre-connecting to database...');
  
  connectToDatabase().then(...).catch(error => {
    logger.error('❌ Backend: Database pre-connection failed');
  });
  // NOTE: Does NOT call app.listen() - serverless
}
```

### Requirements for Vercel Deployment

1. **Frontend:** Must build to `dist/` directory
2. **Backend:** Must run as Node handler (accepts HTTP requests, returns response)
3. **Database:** Must be accessible from Vercel (public endpoint + credentials)
4. **Environment Variables:** Set in Vercel dashboard
   - DATABASE_SECRET_ID (if using Secrets Manager)
   - Or: POSTGRES_URI (direct connection string)
   - Or: POSTGRES_URI in AWS Secrets Manager
   - AWS credentials if accessing AWS services

### API Routing in Vercel

| Request | Routes To |
|---------|-----------|
| `GET /health` | `backend/server.js` handler |
| `GET /api/products` | `backend/server.js` handler |
| `POST /api/orders` | `backend/server.js` handler |
| `GET /` | Serves `dist/index.html` (React) |
| `GET /about` | Serves `dist/index.html` (React routing) |

---

## SECTION 10: EVIDENCE TABLE

| Question | Evidence | File | Conclusion | Confidence |
|----------|----------|------|------------|------------|
| **What runtime modes exist?** | vercel.json + server.js checks process.env.VERCEL | [vercel.json](vercel.json), [server.js](server.js#L451) | Two modes: Vercel serverless OR EC2 HTTP | **HIGH** |
| **Which database?** | Schema is PostgreSQL (BIGSERIAL, JSONB, TIMESTAMPTZ), pg module in package.json | [postgres/schema.sql](database/postgres/schema.sql#L1), [package.json](backend/package.json#L20) | PostgreSQL, not MongoDB | **HIGH** |
| **How does app get database URI?** | runtimeConfig loads from Secrets Manager OR .env fallback | [runtimeConfig.js](config/runtimeConfig.js#L60-90) | Two-stage: Secrets Manager first, .env fallback | **HIGH** |
| **Does development require AWS?** | Secrets Manager is optional in dev mode | [runtimeConfig.js](config/runtimeConfig.js#L78-81) | No, can use .env only | **HIGH** |
| **Does production require AWS?** | Secrets Manager is required (throws error if unavailable) | [runtimeConfig.js](config/runtimeConfig.js#L78-79) | Yes, Secrets Manager is mandatory | **HIGH** |
| **What credentials are used?** | AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY passed explicitly if present, else IAM role | [bedrockService.js](services/bedrockService.js#L17-26) | Explicit creds OR IAM role | **HIGH** |
| **Is SSM Session Manager used?** | No code references StartSession, SendCommand, port forwarding | Grep: no results | SSM not used | **HIGH** |
| **How does client reach backend in Docker?** | nginx proxies to http://backend:5000 (Docker DNS) | [nginx/default.conf](../nginx/default.conf#L19) | Docker internal networking | **HIGH** |
| **Is NODE_ENV production in Docker?** | Hardcoded in docker-compose.yml | [docker-compose.yml](docker-compose.yml#L19) | Yes, always production | **HIGH** |
| **Can app run locally without AWS?** | Yes, with .env file + local POSTGRES_URI | [.env.example](backend/.env.example#L14) | Yes, if PostgreSQL accessible | **HIGH** |
| **Is database public or private?** | Connection string format suggests RDS, but NOT stated in repo | [.env.example](backend/.env.example#L14) | Unknown - depends on AWS setup | **MEDIUM** |
| **Does app use IAM auth for RDS?** | No @aws-sdk/rds-signer, no token generation, uses credentials in connection string | All files searched | No IAM auth | **HIGH** |
| **Is MongoDB still used?** | middleware/database.js references mongoose, but code uses postgresCatalog | [products.js](routes/products.js#L1-10), [postgresCatalogRepository.js](repositories/postgresCatalogRepository.js#L1) | MongoDB driver present but not used; PostgreSQL is active | **MEDIUM** |
| **Rate limiting in development?** | Explicitly disabled | [server.js](server.js#L93-96) | Disabled in dev | **HIGH** |
| **Rate limiting in Docker?** | NODE_ENV=production, so limiter enabled | [docker-compose.yml](docker-compose.yml#L19), [server.js](server.js#L93-96) | Enabled | **HIGH** |

---

## SECTION 11: ASSUMPTION AUDIT

### Common Assumptions & Reality

#### Assumption 1: "Docker is required for development"
- **Why Tempting:** docker-compose.yml exists, project mentions Docker
- **Evidence Supporting:** docker-compose.yml fully defined with services
- **Evidence Against:** [backend/package.json](backend/package.json#L7) has `"dev": "nodemon server.js"` - standalone dev script. README mentions "npm install" without Docker. .env.example designed for direct connection.
- **Reality:** Docker is optional. Can run `npm install && npm run dev` locally if PostgreSQL accessible.
- **Risk:** Users may overcomplicate local setup

#### Assumption 2: "Development mode means local database"
- **Why Tempting:** "development" sounds local
- **Evidence Supporting:** development mode uses .env (local config)
- **Evidence Against:** [backend/.env.example](backend/.env.example#L14) shows `postgresql://<username>:<password>@<rds-endpoint>:...` - RDS hostname, not localhost
- **Reality:** Database is always external (RDS or managed Postgres). No local database migrations/setup.
- **Risk:** High - developers may expect `docker-compose up` to start everything, but it requires pre-existing RDS

#### Assumption 3: "Development mode means no AWS access"
- **Why Tempting:** "development" vs "production"
- **Evidence Supporting:** Secrets Manager optional in dev
- **Evidence Against:** S3, Bedrock, Cognito are still called in development. [services/bedrockService.js](services/bedrockService.js) used in any environment.
- **Reality:** AWS services are accessed in development IF credentials present. Secrets Manager is optional, but S3/Bedrock/Cognito still require AWS credentials.
- **Risk:** High - developers may not set up AWS credentials for local dev, then features fail silently

#### Assumption 4: "SSM tunnel is mandatory"
- **Why Tempting:** AWS best practices mention bastion/tunnel for private RDS
- **Evidence Supporting:** Architecture docs mention "private database subnet"
- **Evidence Against:** Zero SSM references in code, no port forwarding implementation, connection string uses direct credentials
- **Reality:** SSM not used. Application connects directly with username/password in connection string.
- **Risk:** High - team may waste time configuring SSM when it's not needed
- **Status:** **CONFIRMED NOT NEEDED** (unless RDS is in private subnet without public endpoint - would require bastion)

#### Assumption 5: "RDS must be publicly accessible"
- **Why Tempting:** Direct password-based connection suggests public endpoint
- **Evidence Supporting:** Connection string format (no special routing)
- **Evidence Against:** Architecture docs mention "private database subnet"
- **Repository Evidence:** Insufficient to conclude
- **Reality:** RDS could be:
  - Public endpoint (current assumption)
  - Private endpoint accessible from EC2 (likely if production is EC2 in VPC)
  - Private endpoint requiring bastion (NOT implemented in repo)
- **Risk:** Medium - If RDS is private, direct connections will fail

#### Assumption 6: "Docker container automatically accesses private RDS"
- **Why Tempting:** Common AWS architecture pattern
- **Evidence Supporting:** EC2 + Docker mentioned in docs
- **Evidence Against:** docker-compose.yml has no RDS service, no VPC configuration, no security group references
- **Reality:** Docker container cannot automatically access private RDS. Either:
  - RDS endpoint is public (accessible from anywhere)
  - EC2 instance is in VPC, container inherits EC2's network access
  - SSM tunnel is set up externally (not in repo)
- **Risk:** Medium - Docker Compose won't work unless RDS is publicly accessible or EC2 is network-configured

#### Assumption 7: "Secrets Manager is only used in production"
- **Why Tempting:** Called in `if (isProduction)` block
- **Evidence Supporting:** Failures are soft in development
- **Evidence Against:** Code attempts Secrets Manager in ALL environments, only fallback differs
- **Reality:** Secrets Manager is ATTEMPTED in all environments, but failure is acceptable only in development.
- **Risk:** Low - behavior is correct, wording might be confusing

#### Assumption 8: "NODE_ENV alone determines runtime behavior"
- **Why Tempting:** NODE_ENV is the standard way
- **Evidence Supporting:** NODE_ENV checked in many places
- **Evidence Against:** `process.env.VERCEL` is separate gate function, overrides NODE_ENV
- **Reality:** Runtime determined by:
  1. `process.env.VERCEL` (Vercel functions vs local)
  2. `NODE_ENV` (production vs development security settings)
- **Risk:** Low - code handles both correctly

#### Assumption 9: "The project has completed MongoDB → PostgreSQL migration"
- **Why Tempting:** PostgreSQL schema exists, Postgres repos exist
- **Evidence Supporting:** [postgresCatalogRepository.js](repositories/postgresCatalogRepository.js) queries PostgreSQL, [postgres/schema.sql](database/postgres/schema.sql) is complete
- **Evidence Against:** [backend/middleware/database.js](middleware/database.js) references mongoose, routes still import mongoHelpers
- **Reality:** Migration is PARTIALLY complete:
  - Data layer: Postgres active
  - Product catalog: Uses Postgres
  - Middleware: MongoDB error handlers still present (legacy)
  - API responses: Mapped back to MongoDB format for compatibility
  - Other collections: Unknown status (orders, users, blogs, etc.)
- **Risk:** High - unclear which data flows use which database

---

## SECTION 12: IDENTIFIED RISKS & INCONSISTENCIES

### Critical Issues

#### Risk 1: Hard-coded NODE_ENV=production in Docker Compose
**Severity:** MEDIUM  
**Evidence:** [docker-compose.yml](docker-compose.yml#L19)  
**Issue:** `NODE_ENV: production` is hardcoded, forcing production behaviors (rate limiter, minimal errors, required secrets) even in staging/development Docker deploys  
**Impact:** 
- Cannot use Docker Compose for local development without modifying file
- No easy way to test "development" mode in containers
- Secrets must always be provided

**Recommendation:** Make NODE_ENV configurable
```yaml
environment:
  NODE_ENV: ${NODE_ENV:-production}
```

#### Risk 2: PostgreSQL SSL Mode Default is "no-verify"
**Severity:** MEDIUM  
**Evidence:** [backend/config/postgres.js](backend/config/postgres.js#L24), [backend/.env.example](backend/.env.example#L15)  
**Issue:** Default `POSTGRES_SSLMODE=no-verify` disables certificate validation  
**Impact:** Vulnerable to MITM attacks on database connection  
**Recommendation:** Change default to `verify-full` for production RDS

#### Risk 3: Incomplete Database Migration State Unknown
**Severity:** MEDIUM  
**Evidence:** 
- [backend/middleware/database.js](middleware/database.js) still references mongoose
- [backend/routes/orders.js](routes/orders.js#L1100-1133) has `/test/mongodb` endpoint with MongoDB connection test
  
**Issue:** Unclear which data flows use PostgreSQL vs MongoDB  
**Impact:** Maintenance confusion, potential data inconsistency  
**Recommendation:** Document which collections use which database, remove MongoDB-only code

#### Risk 4: No Clear Development Setup Documentation
**Severity:** MEDIUM  
**Evidence:**
- [README.md](README.md) mentions Docker but not standalone setup
- [.env.example](backend/.env.example) requires external PostgreSQL (no instructions)
- [backend/.env.example](backend/.env.example#L42) mentions AWS Secrets Manager but development requires it for some auth flows

**Issue:** New developer would struggle to set up local environment  
**Impact:** Onboarding friction, potential setup errors  
**Recommendation:** Create `DEVELOPMENT_SETUP.md` with step-by-step instructions

#### Risk 5: AWS Credentials Exposure Risk
**Severity:** MEDIUM  
**Evidence:** [backend/services/bedrockService.js](services/bedrockService.js#L17-26)  
**Issue:** AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY stored in environment variables (not in Secrets Manager)  
**Impact:** If .env file committed, credentials exposed  
**Mitigation in Place:** .env in .gitignore  
**Recommendation:** Consider using IAM roles exclusively, avoid explicit credentials

#### Risk 6: Container Logging to CloudWatch Without Credentials Validation
**Severity:** LOW  
**Evidence:** [docker-compose.yml](docker-compose.yml#L14-18)  
```yaml
logging:
  driver: awslogs
  options:
    awslogs-region: ap-southeast-1
    awslogs-group: /balancoffee/backend
```
**Issue:** Assumes AWS credentials available on EC2, but no fallback if missing  
**Impact:** Logs lost if IAM role not configured  
**Recommendation:** Add conditional logging configuration

### Moderate Issues

#### Issue 1: postgresCatalogRepository Still Returns MongoDB-Style _id
**Evidence:** [postgresCatalogRepository.js](repositories/postgresCatalogRepository.js#L35)  
```javascript
return {
  _id: row.legacy_mongo_id,  // Maps PostgreSQL to MongoDB format
  id: row.legacy_mongo_id,
  ...
};
```
**Impact:** API maintains backward compatibility but makes schema confusing  
**Recommendation:** Document this mapping, plan for eventual MongoDB format removal

#### Issue 2: No Health Check Validation in Docker
**Evidence:** [backend/Dockerfile](backend/Dockerfile#L26-29)  
```dockerfile
HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --retries=3 \
  CMD wget --spider http://localhost:5000/health || exit 1
```
But [docker-compose.yml](docker-compose.yml) defines NO healthcheck on backend service

**Impact:** Docker Compose won't automatically restart unhealthy backend  
**Recommendation:** Add healthcheck to docker-compose.yml

---

## SECTION 13: MISSING EVIDENCE

| Question | Status | Impact |
|----------|--------|--------|
| **Is RDS publicly accessible or in private subnet?** | Unknown | High - affects network architecture |
| **What is the complete database migration status?** | Partial - PostgreSQL active but MongoDB code still present | High - affects troubleshooting |
| **Are all AWS services (S3, Bedrock, Cognito) required for basic functionality?** | Unknown | Medium - affects local development requirements |
| **What is the actual AWS IAM policy required for EC2 role?** | Not documented | Medium - affects deployment |
| **Are there other data collections still using MongoDB?** | Unknown | Medium - affects data consistency |
| **Is vercel.json actively maintained / used?** | Unclear - docs mention EC2, but vercel.json suggests Vercel deployment | Medium - affects deployment strategy |
| **What PostgreSQL version is required?** | Not specified | Low - likely flexible |
| **How is database schema updated in production?** | No migration system documented | Medium - affects deployments |

---

## SECTION 14: FINAL CONCLUSIONS

### CONFIRMED ARCHITECTURE

This project supports **two independent deployment patterns**:

#### Pattern A: Vercel Serverless (Stateless)
- Frontend: Static build (React/Vite) → Vercel CDN
- Backend: Node.js handler function → Vercel Functions
- Database: External PostgreSQL (RDS)
- Configuration: Environment variables in Vercel dashboard
- Deployment: `git push` → GitHub → Vercel auto-deploy

#### Pattern B: EC2 with Docker Compose (Stateful)
- Frontend: nginx container (static + proxy)
- Backend: Express HTTP server (Node container)
- Database: External PostgreSQL (RDS)
- Configuration: `.env` file + docker-compose.yml
- Deployment: Manual docker-compose up, or CI/CD

### CONFIRMED DATABASE FLOW

```
All Environments:
  1. Load .env (if exists)
  2. Call getRuntimeConfig()
  3. If production: Try AWS Secrets Manager
  4. If dev OR Secrets Manager fails: Use env vars
  5. Connect to PostgreSQL via pg module with username/password
  6. Never uses SSM tunnel or IAM authentication
```

### CONFIRMED AWS DEPENDENCIES

**Required:**
- AWS Secrets Manager (production only, with env var fallback)
- IAM role (EC2 deployment) OR explicit credentials (Vercel)

**Optional but Recommended:**
- S3 (image uploads)
- Cognito (authentication)
- Bedrock (AI recommendations)
- CloudWatch (logging in EC2)

**Not Used:**
- SSM Session Manager
- RDS Proxy
- IAM database authentication
- ECS, Lambda, AppRunner, etc.

### SSM REQUIREMENT: NO

**Repository provides: NO evidence of SSM usage**

**Verdict:** SSM Session Manager is **NOT required** for this application.

- If RDS has public endpoint: Direct password-based connection works
- If RDS is in private VPC: Would need either:
  - Bastion host (manual setup, not in repo)
  - VPC endpoint (AWS networking, not in repo)
  - SSM Session Manager tunnel (not implemented)

Current codebase assumes direct connection. AWS setup is responsible for network availability.

---

## SECTION 15: RECOMMENDED NEXT STEPS

### Immediate (High Priority)

1. **Clarify Deployment Target**
   - Is production on Vercel or EC2?
   - Both configs exist - which is actually used?
   - Document primary deployment pattern

2. **Document RDS Connectivity**
   - Is RDS publicly accessible?
   - What security groups/network allow connection?
   - Create `INFRASTRUCTURE.md` explaining network topology

3. **Complete Database Migration**
   - Remove MongoDB code (middleware/database.js, test endpoints)
   - Document which data actually uses PostgreSQL
   - Or confirm status of all collections

4. **Development Setup Guide**
   - Create `DEVELOPMENT_SETUP.md`
   - Include PostgreSQL installation / connection
   - Include AWS credentials setup (if needed for features)
   - Include Docker Compose instructions (with NODE_ENV override if needed)

### Short Term (Medium Priority)

1. **Fix docker-compose.yml**
   - Make NODE_ENV configurable
   - Add healthcheck to backend service
   - Document .env file requirements

2. **Harden Database Connection**
   - Change POSTGRES_SSLMODE default from `no-verify` to `verify-full`
   - Document SSL certificate requirements
   - Add TLS testing to health check

3. **Add Database Migration System**
   - Install Flyway or similar
   - Document schema update process
   - Add migration verification to health check

4. **Verify AWS Permissions**
   - Document required IAM policy
   - Test Bedrock/S3/Cognito in each environment
   - Add dependency checks to startup

### Long Term (Low Priority)

1. **Consolidate Deployment Patterns**
   - Choose: Vercel OR EC2, not both
   - Remove unused configuration
   - Simplify deployment documentation

2. **Complete API Modernization**
   - Finish removing MongoDB-format responses
   - Implement consistent REST API contract
   - Add API versioning

3. **Implement Monitoring**
   - Add application performance monitoring (APM)
   - Database query performance tracking
   - AWS service usage dashboards

---

## APPENDIX: FILE INVENTORY

### Configuration Files
- [backend/config/runtimeConfig.js](backend/config/runtimeConfig.js) - Main runtime configuration + Secrets Manager
- [backend/config/postgres.js](backend/config/postgres.js) - PostgreSQL connection pool
- [backend/config/authCookies.js](backend/config/authCookies.js) - Cookie configuration
- [backend/config/passport.js](backend/config/passport.js) - Passport auth configuration

### Deployment Files
- [vercel.json](vercel.json) - Vercel deployment config
- [docker-compose.yml](docker-compose.yml) - Docker Compose for EC2
- [Dockerfile](Dockerfile) - Frontend nginx build
- [backend/Dockerfile](backend/Dockerfile) - Backend Node.js build
- [nginx/default.conf](nginx/default.conf) - Nginx proxy configuration

### Database Files
- [backend/config/postgres.js](backend/config/postgres.js) - Connection pool
- [backend/database/postgres/schema.sql](backend/database/postgres/schema.sql) - PostgreSQL schema
- [backend/scripts/migrate-mongo-to-postgres.js](backend/scripts/migrate-mongo-to-postgres.js) - Migration script
- [backend/repositories/postgresCatalogRepository.js](backend/repositories/postgresCatalogRepository.js) - Data access layer

### AWS Service Files
- [backend/services/bedrockService.js](backend/services/bedrockService.js) - AI recommendation service
- [backend/services/imageService.js](backend/services/imageService.js) - S3 image upload
- [backend/services/cognitoService.js](backend/services/cognitoService.js) - Cognito authentication
- [backend/config/runtimeConfig.js](backend/config/runtimeConfig.js) - Secrets Manager access

### Environment Configuration
- [backend/.env.example](backend/.env.example) - Example environment variables
- [.env.example](.env.example) - Frontend environment variables
- [.gitignore](.gitignore) - Git ignore rules (.env excluded)
- [.dockerignore](.dockerignore) - Docker ignore rules

### Documentation
- [README.md](README.md) - Project overview
- [docs/01-solution-design-document.md](docs/01-solution-design-document.md) - Design document
- [docs/02-solution-architecture.md](docs/02-solution-architecture.md) - Architecture
- [docs/mongodb-to-rds-migration-plan.md](docs/mongodb-to-rds-migration-plan.md) - Migration documentation
- [implementation_plan.md](implementation_plan.md) - Feature implementation plan
- [CHANGES_NOTE.md](CHANGES_NOTE.md) - Recent changes
- [vercel.json](vercel.json#L1) - Deployment configuration (also in appendix)

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-14  
**Status:** COMPLETE - Evidence-first analysis concluded  
**Confidence Level:** HIGH (most findings supported by direct code evidence)
