const crypto = require('crypto');
const { query } = require('../config/postgres');

function newLegacyId() {
  return crypto.randomBytes(12).toString('hex');
}

function json(value, fallback) {
  if (value === undefined || value === null) {
    return fallback;
  }
  return value;
}

function mapAddress(row) {
  return {
    _id: row.legacy_mongo_id,
    type: row.type,
    firstName: row.first_name,
    lastName: row.last_name,
    address1: row.address1,
    street: row.street,
    wardCommune: row.ward_commune,
    district: row.district,
    city: row.city,
    province: row.province,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone,
    isDefault: !!row.is_default
  };
}

async function attachAddresses(user) {
  if (!user) return null;

  const result = await query(`
    SELECT *
    FROM user_addresses
    WHERE user_id = $1
    ORDER BY id ASC
  `, [user._postgresId]);

  return {
    ...user,
    addresses: result.rows.map(mapAddress)
  };
}

function mapUserRow(row) {
  if (!row) return null;

  return {
    _id: row.legacy_mongo_id,
    id: row.legacy_mongo_id,
    cognitoSub: row.cognito_sub,
    email: row.email,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    fullName: row.full_name || '',
    phone: row.phone,
    role: row.role || 'customer',
    status: row.status || 'active',
    emailVerified: !!row.email_verified,
    phoneVerified: !!row.phone_verified,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    providers: json(row.providers, {}),
    preferences: json(row.preferences, {}),
    stats: json(row.stats, {}),
    security: json(row.security, {}),
    metadata: json(row.metadata, {}),
    lastActivityAt: row.last_activity_at,
    lastTested: row.last_tested,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    _postgresId: row.id
  };
}

async function mapUserWithAddresses(row) {
  const user = mapUserRow(row);
  if (!user) return null;
  const withAddresses = await attachAddresses(user);
  delete withAddresses._postgresId;
  return withAddresses;
}

async function findByCognitoSub(cognitoSub) {
  const result = await query('SELECT * FROM users WHERE cognito_sub = $1 LIMIT 1', [cognitoSub]);
  return mapUserWithAddresses(result.rows[0]);
}

async function findByEmail(email) {
  const result = await query('SELECT * FROM users WHERE lower(email) = lower($1) LIMIT 1', [email]);
  return mapUserWithAddresses(result.rows[0]);
}

async function findByLegacyId(legacyMongoId) {
  const result = await query('SELECT * FROM users WHERE legacy_mongo_id = $1 LIMIT 1', [legacyMongoId]);
  return mapUserWithAddresses(result.rows[0]);
}

async function replaceAddresses(postgresUserId, addresses = []) {
  await query('DELETE FROM user_addresses WHERE user_id = $1', [postgresUserId]);

  for (const address of addresses) {
    await query(`
      INSERT INTO user_addresses (
        legacy_mongo_id,
        user_id,
        type,
        first_name,
        last_name,
        address1,
        street,
        ward_commune,
        district,
        city,
        province,
        postal_code,
        country,
        phone,
        is_default
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      address.legacyMongoId || address._id || newLegacyId(),
      postgresUserId,
      address.type || null,
      address.firstName || null,
      address.lastName || null,
      address.address1 || null,
      address.street || null,
      address.wardCommune || null,
      address.district || null,
      address.city || null,
      address.province || null,
      address.postalCode || null,
      address.country || null,
      address.phone || null,
      address.isDefault === true || address.isDefault === 'true'
    ]);
  }
}

function buildUserUpdate(data) {
  return {
    cognito_sub: data.cognitoSub,
    email: data.email?.toLowerCase(),
    first_name: data.firstName,
    last_name: data.lastName,
    full_name: data.fullName,
    phone: data.phone,
    role: data.role,
    status: data.status,
    email_verified: data.emailVerified,
    phone_verified: data.phoneVerified,
    date_of_birth: data.dateOfBirth || null,
    gender: data.gender,
    providers: data.providers,
    preferences: data.preferences,
    stats: data.stats,
    security: data.security,
    metadata: data.metadata,
    last_activity_at: data.lastActivityAt,
    last_tested: data.lastTested,
    updated_at: new Date()
  };
}

async function upsertProfile(data) {
  const email = data.email.toLowerCase();
  const existingResult = await query(`
    SELECT *
    FROM users
    WHERE ($1::text IS NOT NULL AND cognito_sub = $1)
       OR lower(email) = lower($2)
    LIMIT 1
  `, [data.cognitoSub || null, email]);

  const updateData = buildUserUpdate({
    ...data,
    email,
    role: data.role || existingResult.rows[0]?.role || 'customer',
    status: data.status || existingResult.rows[0]?.status || 'inactive',
    emailVerified: data.emailVerified ?? existingResult.rows[0]?.email_verified ?? false,
    phoneVerified: data.phoneVerified ?? existingResult.rows[0]?.phone_verified ?? false
  });

  if (existingResult.rows[0]) {
    const existing = existingResult.rows[0];
    const entries = Object.entries(updateData).filter(([, value]) => value !== undefined);
    const sets = entries.map(([key], index) => `${key} = $${index + 1}`);
    const values = entries.map(([, value]) => (
      value && typeof value === 'object' && !(value instanceof Date) ? JSON.stringify(value) : value
    ));

    await query(`
      UPDATE users
      SET ${sets.join(', ')}
      WHERE id = $${values.length + 1}
    `, [...values, existing.id]);

    if (data.addresses) {
      await replaceAddresses(existing.id, data.addresses);
    }

    return findByLegacyId(existing.legacy_mongo_id);
  }

  const legacyMongoId = data.legacyMongoId || data._id || newLegacyId();
  const insertData = {
    legacy_mongo_id: legacyMongoId,
    ...Object.fromEntries(Object.entries(updateData).filter(([, value]) => value !== undefined)),
    created_at: new Date()
  };
  const entries = Object.entries(insertData);
  const columns = entries.map(([key]) => key);
  const values = entries.map(([, value]) => (
    value && typeof value === 'object' && !(value instanceof Date) ? JSON.stringify(value) : value
  ));
  const placeholders = values.map((_, index) => `$${index + 1}`);

  const insertResult = await query(`
    INSERT INTO users (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING id, legacy_mongo_id
  `, values);

  if (data.addresses) {
    await replaceAddresses(insertResult.rows[0].id, data.addresses);
  }

  return findByLegacyId(insertResult.rows[0].legacy_mongo_id);
}

async function linkCognitoUser({ legacyMongoId, cognitoSub }) {
  await query(`
    UPDATE users
    SET cognito_sub = $1,
        email_verified = TRUE,
        status = COALESCE(NULLIF(status, ''), 'active'),
        updated_at = NOW()
    WHERE legacy_mongo_id = $2
  `, [cognitoSub, legacyMongoId]);

  return findByLegacyId(legacyMongoId);
}

async function confirmEmail(email) {
  await query(`
    UPDATE users
    SET email_verified = TRUE,
        status = 'active',
        updated_at = NOW()
    WHERE lower(email) = lower($1)
  `, [email]);
}

async function updateProfile(legacyMongoId, data) {
  const existingResult = await query('SELECT * FROM users WHERE legacy_mongo_id = $1 LIMIT 1', [legacyMongoId]);
  if (existingResult.rowCount === 0) return null;

  const updateData = buildUserUpdate(data);
  const entries = Object.entries(updateData).filter(([, value]) => value !== undefined);
  const sets = entries.map(([key], index) => `${key} = $${index + 1}`);
  const values = entries.map(([, value]) => (
    value && typeof value === 'object' && !(value instanceof Date) ? JSON.stringify(value) : value
  ));

  if (sets.length > 0) {
    await query(`
      UPDATE users
      SET ${sets.join(', ')}
      WHERE legacy_mongo_id = $${values.length + 1}
    `, [...values, legacyMongoId]);
  }

  if (data.addresses) {
    await replaceAddresses(existingResult.rows[0].id, data.addresses);
  }

  return findByLegacyId(legacyMongoId);
}

module.exports = {
  findByCognitoSub,
  findByEmail,
  findByLegacyId,
  upsertProfile,
  linkCognitoUser,
  confirmEmail,
  updateProfile
};
