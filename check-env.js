#!/usr/bin/env node

/**
 * Script to check if .env file is properly configured
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

console.log('🔍 Checking .env file configuration...\n');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log(`\n📝 Expected location: ${envPath}`);
  console.log('\n📋 To fix this:');
  console.log('   1. Copy .env.example to .env:');
  console.log('      cp .env.example .env');
  console.log('   2. Edit .env and add your credentials\n');
  process.exit(1);
}

console.log('✅ .env file found');

// Read and check .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const requiredVars = {
  MONGO_URI: false,
  ALPHA_VANTAGE_API_KEY: false,
  JWT_SECRET: false,
};

let hasErrors = false;

envLines.forEach(line => {
  const [key] = line.split('=');
  if (key && requiredVars.hasOwnProperty(key.trim())) {
    const value = line.split('=').slice(1).join('=').trim();
    if (value && value !== `your_${key.toLowerCase().replace(/_/g, '_')}`) {
      requiredVars[key.trim()] = true;
    } else {
      console.warn(`⚠️  ${key.trim()} is set but appears to be a placeholder`);
      hasErrors = true;
    }
  }
});

console.log('\n📋 Environment Variables Status:');
Object.keys(requiredVars).forEach((key) => {
  if (requiredVars[key]) {
    console.log(`   ✅ ${key}`);
  } else {
    console.log(`   ❌ ${key} - Missing or not configured`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.log('\n❌ Some environment variables are missing or not configured.');
  console.log('   Please update your .env file with the correct values.\n');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are configured!\n');
  process.exit(0);
}

