/**
 * Environment Variable Validation Script
 * Ensures all required environment variables are set correctly
 *
 * Security: Validates JWT_SECRET strength, checks for default values
 *
 * Usage: node scripts/validate-env.js
 */

require('dotenv').config();
const crypto = require('crypto');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const errors = [];
const warnings = [];
const info = [];

console.log(`\n${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║  Environment Variable Validation          ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}\n`);

// Required variables
const required = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
  'JWT_EXPIRE',
  'DB_DIALECT'
];

// Check required variables
console.log('📋 Checking required variables...\n');

required.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    errors.push(`Missing required variable: ${varName}`);
  } else {
    console.log(`${colors.green}✓${colors.reset} ${varName}: Set`);
  }
});

console.log('');

// Validate JWT_SECRET strength
console.log('🔐 Validating JWT_SECRET security...\n');

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  errors.push('JWT_SECRET is not set!');
} else {
  // Check length
  if (jwtSecret.length < 64) {
    errors.push(`JWT_SECRET too short (${jwtSecret.length} chars). Minimum: 64 characters`);
    console.log(`${colors.red}✗${colors.reset} Length: ${jwtSecret.length} chars (minimum: 64)`);
  } else {
    console.log(`${colors.green}✓${colors.reset} Length: ${jwtSecret.length} chars`);
  }

  // Check for default/example values
  const dangerousDefaults = [
    'your-secret-key-here',
    'your-jwt-secret',
    'changeme',
    'secret',
    'your-actual-secret-key-here-change-this-to-something-secure'
  ];

  if (dangerousDefaults.some(def => jwtSecret.toLowerCase().includes(def))) {
    errors.push('JWT_SECRET appears to be a default/example value! Generate a secure random secret.');
    console.log(`${colors.red}✗${colors.reset} Security: Using default/example value (DANGEROUS!)`);
  } else {
    console.log(`${colors.green}✓${colors.reset} Security: Not using default value`);
  }

  // Check entropy (randomness)
  const uniqueChars = new Set(jwtSecret).size;
  const entropyRatio = uniqueChars / jwtSecret.length;

  // Note: Hex strings (0-9, a-f) will show ~12.5% unique chars (16/128)
  // This is EXPECTED and SECURE for crypto.randomBytes().toString('hex')
  const isHexString = /^[0-9a-f]+$/i.test(jwtSecret);

  if (entropyRatio < 0.3 && !isHexString) {
    warnings.push('JWT_SECRET has low entropy (not very random)');
    console.log(`${colors.yellow}⚠${colors.reset} Entropy: Low (${(entropyRatio * 100).toFixed(1)}% unique characters)`);
  } else if (isHexString && jwtSecret.length >= 128) {
    console.log(`${colors.green}✓${colors.reset} Entropy: Secure hex string (128 chars = 64 bytes random)`);
  } else {
    console.log(`${colors.green}✓${colors.reset} Entropy: Good (${(entropyRatio * 100).toFixed(1)}% unique characters)`);
  }
}

console.log('');

// Validate database configuration
console.log('💾 Validating database configuration...\n');

const dbDialect = process.env.DB_DIALECT;

if (dbDialect === 'sqlite') {
  console.log(`${colors.yellow}⚠${colors.reset} Using SQLite (development only)`);

  // CRITICAL: Block SQLite in production
  if (process.env.NODE_ENV === 'production') {
    errors.push('SQLite is NOT supported in production. Use PostgreSQL (set DB_DIALECT=postgres).');
    console.log(`${colors.red}✗${colors.reset} Production Environment: SQLite detected (BLOCKED)`);
  }

  const dbStorage = process.env.DB_STORAGE;
  if (!dbStorage) {
    errors.push('DB_STORAGE not set (required for SQLite)');
  } else {
    console.log(`${colors.green}✓${colors.reset} DB_STORAGE: ${dbStorage}`);
  }
} else if (dbDialect === 'postgres') {
  console.log(`${colors.green}✓${colors.reset} Using PostgreSQL`);

  const requiredPgVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  requiredPgVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing PostgreSQL variable: ${varName}`);
    }
  });

  // Check if using default password
  const dbPassword = process.env.DB_PASSWORD;
  if (dbPassword && (
    dbPassword.includes('password') ||
    dbPassword.includes('123456') ||
    dbPassword === 'postgres'
  )) {
    errors.push('DB_PASSWORD appears to be a default/weak password!');
  }
} else {
  errors.push(`Unknown DB_DIALECT: ${dbDialect}. Must be 'sqlite' or 'postgres'`);
}

console.log('');

// Check NODE_ENV
console.log('🌍 Validating environment settings...\n');

const nodeEnv = process.env.NODE_ENV;
const validEnvs = ['development', 'test', 'production'];

if (!validEnvs.includes(nodeEnv)) {
  warnings.push(`NODE_ENV="${nodeEnv}" is unusual. Recommended: development, test, or production`);
  console.log(`${colors.yellow}⚠${colors.reset} NODE_ENV: ${nodeEnv} (unusual value)`);
} else {
  console.log(`${colors.green}✓${colors.reset} NODE_ENV: ${nodeEnv}`);
}

// Production-specific checks
if (nodeEnv === 'production') {
  console.log(`\n${colors.cyan}🚀 Production mode detected - additional checks:${colors.reset}\n`);

  // Check CORS
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin || corsOrigin === '*') {
    errors.push('CORS_ORIGIN must be set to specific domain in production (not *)');
  } else {
    console.log(`${colors.green}✓${colors.reset} CORS_ORIGIN: ${corsOrigin}`);
  }

  // Check for HTTPS
  if (corsOrigin && !corsOrigin.startsWith('https://')) {
    warnings.push('CORS_ORIGIN should use HTTPS in production');
  }
}

console.log('');

// Security recommendations
console.log('🛡️  Security recommendations...\n');

// Check rate limiting
const rateLimitMax = process.env.RATE_LIMIT_MAX_REQUESTS;
if (!rateLimitMax) {
  info.push('Consider setting RATE_LIMIT_MAX_REQUESTS for API rate limiting');
} else if (parseInt(rateLimitMax) > 1000) {
  warnings.push(`RATE_LIMIT_MAX_REQUESTS is very high (${rateLimitMax}). Consider lowering for production.`);
}

// Check file upload limits
const maxFileSize = process.env.MAX_FILE_SIZE;
if (!maxFileSize) {
  info.push('MAX_FILE_SIZE not set (will use default)');
}

console.log('');

// Summary
console.log(`${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║  Validation Summary                        ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}\n`);

if (errors.length > 0) {
  console.log(`${colors.red}❌ ERRORS (${errors.length}):${colors.reset}`);
  errors.forEach(err => console.log(`   • ${err}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log(`${colors.yellow}⚠️  WARNINGS (${warnings.length}):${colors.reset}`);
  warnings.forEach(warn => console.log(`   • ${warn}`));
  console.log('');
}

if (info.length > 0) {
  console.log(`${colors.blue}ℹ️  INFO (${info.length}):${colors.reset}`);
  info.forEach(i => console.log(`   • ${i}`));
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log(`${colors.green}✅ All validation checks passed!${colors.reset}\n`);
  process.exit(0);
} else if (errors.length === 0) {
  console.log(`${colors.yellow}⚠️  Validation passed with warnings${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}❌ Validation failed - please fix errors above${colors.reset}\n`);
  process.exit(1);
}
