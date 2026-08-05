const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-southeast-1';

const secretsClient = new SecretsManagerClient({ region });
const secretCache = new Map();
let runtimeConfigPromise = null;

function parseSecretValue(secretId, value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`Secret ${secretId} must be valid JSON`);
  }
}

async function loadSecret(secretId) {
  if (!secretId) {
    return {};
  }

  if (secretCache.has(secretId)) {
    return secretCache.get(secretId);
  }

  const response = await secretsClient.send(new GetSecretValueCommand({ SecretId: secretId }));
  const secretValue = response.SecretString
    ? parseSecretValue(secretId, response.SecretString)
    : {};

  secretCache.set(secretId, secretValue);
  return secretValue;
}

function requireValue(config, key) {
  if (!config[key]) {
    throw new Error(`Missing required runtime config: ${key}`);
  }
}

async function loadRuntimeConfig() {
  const databaseSecretId = process.env.DATABASE_SECRET_ID;
  const smtpSecretId = process.env.SMTP_SECRET_ID;
  const cognitoSecretId = process.env.COGNITO_SECRET_ID;

  let databaseSecret = {};
  let smtpSecret = {};
  let cognitoSecret = {};

  try {
    [databaseSecret, smtpSecret, cognitoSecret] = await Promise.all([
      loadSecret(databaseSecretId),
      loadSecret(smtpSecretId),
      loadSecret(cognitoSecretId)
    ]);
  } catch (error) {
    if (isProduction) {
      throw error;
    }

    console.warn('AWS Secrets Manager unavailable; falling back to local .env config:', error.message);
  }

  const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    awsRegion: region,
    mongoUri: databaseSecret.MONGODB_URI || process.env.MONGODB_URI,
    emailHost: smtpSecret.EMAIL_HOST || process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
    emailPort: Number(smtpSecret.EMAIL_PORT || process.env.EMAIL_PORT || process.env.SMTP_PORT || 587),
    emailUser: smtpSecret.EMAIL_USER || process.env.EMAIL_USER || process.env.SMTP_USER,
    emailPassword: smtpSecret.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS,
    cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
    cognitoClientId: process.env.COGNITO_CLIENT_ID,
    cognitoClientSecret: cognitoSecret.COGNITO_CLIENT_SECRET || process.env.COGNITO_CLIENT_SECRET,
    authCookieSecure: String(process.env.AUTH_COOKIE_SECURE || isProduction) === 'true',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  };

  requireValue(config, 'mongoUri');
  requireValue(config, 'cognitoUserPoolId');
  requireValue(config, 'cognitoClientId');

  if (isProduction) {
    requireValue(config, 'cognitoClientSecret');
    requireValue(config, 'emailUser');
    requireValue(config, 'emailPassword');
  } else if (!config.cognitoClientSecret) {
    console.warn('Cognito client secret is not loaded; Cognito auth calls will fail until Secrets Manager access is configured.');
  }

  return config;
}

function getRuntimeConfig() {
  if (!runtimeConfigPromise) {
    runtimeConfigPromise = loadRuntimeConfig();
  }

  return runtimeConfigPromise;
}

function clearRuntimeConfigCache() {
  runtimeConfigPromise = null;
  secretCache.clear();
}

module.exports = {
  getRuntimeConfig,
  clearRuntimeConfigCache,
  loadSecret
};
