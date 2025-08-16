#!/usr/bin/env node

// Setup script để tạo environment files và thư mục cần thiết
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Balan Coffee & Roastery project...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1. Create environment files
function createEnvFiles() {
  log('📝 Creating environment files...', 'blue');
  
  // Frontend .env
  const frontendEnvExample = path.join(process.cwd(), '.env.example');
  const frontendEnv = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(frontendEnvExample) && !fs.existsSync(frontendEnv)) {
    fs.copyFileSync(frontendEnvExample, frontendEnv);
    log('✅ Created .env from .env.example', 'green');
  } else if (fs.existsSync(frontendEnv)) {
    log('⚠️  .env already exists', 'yellow');
  }
  
  // Backend .env
  const backendEnvExample = path.join(process.cwd(), 'backend', '.env.example');
  const backendEnv = path.join(process.cwd(), 'backend', '.env');
  
  if (fs.existsSync(backendEnvExample) && !fs.existsSync(backendEnv)) {
    fs.copyFileSync(backendEnvExample, backendEnv);
    log('✅ Created backend/.env from backend/.env.example', 'green');
  } else if (fs.existsSync(backendEnv)) {
    log('⚠️  backend/.env already exists', 'yellow');
  }
}

// 2. Create upload directories
function createUploadDirs() {
  log('\n📁 Creating upload directories...', 'blue');
  
  const uploadDirs = [
    'backend/uploads',
    'backend/uploads/products',
    'backend/uploads/blogs',
    'backend/uploads/avatars',
    'backend/uploads/thumbnails'
  ];
  
  uploadDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`✅ Created ${dir}`, 'green');
    } else {
      log(`⚠️  ${dir} already exists`, 'yellow');
    }
  });
}

// 3. Create gitkeep files for empty directories
function createGitkeepFiles() {
  log('\n📄 Creating .gitkeep files...', 'blue');
  
  const gitkeepDirs = [
    'backend/uploads/products',
    'backend/uploads/blogs',
    'backend/uploads/avatars',
    'backend/uploads/thumbnails'
  ];
  
  gitkeepDirs.forEach(dir => {
    const gitkeepPath = path.join(process.cwd(), dir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '# Keep this directory in git\n');
      log(`✅ Created ${dir}/.gitkeep`, 'green');
    }
  });
}

// 4. Validate required files
function validateSetup() {
  log('\n🔍 Validating setup...', 'blue');
  
  const requiredFiles = [
    '.env.example',
    'backend/.env.example',
    'package.json',
    'backend/package.json',
    'src/config/firebase.js',
    'backend/config/firebase.js'
  ];
  
  let allValid = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ Missing: ${file}`, 'red');
      allValid = false;
    }
  });
  
  return allValid;
}

// 5. Show next steps
function showNextSteps() {
  log('\n🎯 Next Steps:', 'blue');
  log('1. Create Firebase project at https://console.firebase.google.com/', 'yellow');
  log('2. Copy Firebase credentials to .env and backend/.env', 'yellow');
  log('3. Update environment variables with your values', 'yellow');
  log('4. Run: npm install && cd backend && npm install', 'yellow');
  log('5. Setup sample data: cd backend && npm run firebase:setup', 'yellow');
  log('6. Start development: npm run dev (frontend) & cd backend && npm run dev (backend)', 'yellow');
  
  log('\n📚 Documentation:', 'blue');
  log('- ENV-SETUP.md - Environment variables guide', 'yellow');
  log('- FIREBASE-DEPLOYMENT.md - Firebase setup guide', 'yellow');
  log('- FIREBASE-FREE-SUMMARY.md - Free plan summary', 'yellow');
}

// Main setup function
function main() {
  try {
    createEnvFiles();
    createUploadDirs();
    createGitkeepFiles();
    
    const isValid = validateSetup();
    
    if (isValid) {
      log('\n🎉 Setup completed successfully!', 'green');
      showNextSteps();
    } else {
      log('\n❌ Setup incomplete. Please check missing files.', 'red');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run setup
main();
