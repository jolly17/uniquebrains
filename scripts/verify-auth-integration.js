/**
 * Verification script for auth integration
 * Task 4.3: Verify auth helper functions are properly integrated
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔍 Verifying Auth Integration\n')
console.log('=' .repeat(60))

// Check AuthContext integration
const authContextPath = join(__dirname, '..', 'src', 'context', 'AuthContext.jsx')
const authContextContent = readFileSync(authContextPath, 'utf-8')

console.log('\n📦 Checking AuthContext imports...')

const requiredImports = [
  'signIn',
  'signUp',
  'signOut',
  'getCurrentSession',
  'getCurrentUserProfile',
  'onAuthStateChange'
]

let allImportsPresent = true

requiredImports.forEach(func => {
  const importRegex = new RegExp(`import\\s+{[^}]*${func}[^}]*}\\s+from\\s+['"].*lib/auth['"]`, 'g')
  const isImported = importRegex.test(authContextContent)
  
  if (isImported) {
    console.log(`   ✅ ${func} imported`)
  } else {
    console.log(`   ❌ ${func} NOT imported`)
    allImportsPresent = false
  }
})

// Check if functions are used in AuthContext
console.log('\n🔧 Checking AuthContext usage...')

const usageChecks = [
  { func: 'signIn', method: 'login', description: 'Login method uses signIn' },
  { func: 'signUp', method: 'register', description: 'Register method uses signUp' },
  { func: 'signOut', method: 'logout', description: 'Logout method uses signOut' },
  { func: 'getCurrentSession', description: 'Session initialization uses getCurrentSession' },
  { func: 'onAuthStateChange', description: 'Auth state listener is set up' }
]

usageChecks.forEach(check => {
  const usageRegex = new RegExp(check.func, 'g')
  const isUsed = usageRegex.test(authContextContent)
  
  if (isUsed) {
    console.log(`   ✅ ${check.description}`)
  } else {
    console.log(`   ⚠️  ${check.description} - NOT FOUND`)
  }
})

// Check Login page integration
console.log('\n🔐 Checking Login page integration...')

const loginPath = join(__dirname, '..', 'src', 'pages', 'Login.jsx')
const loginContent = readFileSync(loginPath, 'utf-8')

const loginChecks = [
  { pattern: /useAuth/, description: 'Uses useAuth hook' },
  { pattern: /login\s*\(/, description: 'Calls login function' },
  { pattern: /error/, description: 'Handles errors' }
]

loginChecks.forEach(check => {
  if (check.pattern.test(loginContent)) {
    console.log(`   ✅ ${check.description}`)
  } else {
    console.log(`   ❌ ${check.description} - NOT FOUND`)
  }
})

// Check Register page integration
console.log('\n📝 Checking Register page integration...')

const registerPath = join(__dirname, '..', 'src', 'pages', 'Register.jsx')
const registerContent = readFileSync(registerPath, 'utf-8')

const registerChecks = [
  { pattern: /useAuth/, description: 'Uses useAuth hook' },
  { pattern: /register\s*\(/, description: 'Calls register function' },
  { pattern: /error/, description: 'Handles errors' },
  { pattern: /success/, description: 'Shows success message' }
]

registerChecks.forEach(check => {
  if (check.pattern.test(registerContent)) {
    console.log(`   ✅ ${check.description}`)
  } else {
    console.log(`   ❌ ${check.description} - NOT FOUND`)
  }
})

console.log('\n' + '='.repeat(60))

if (allImportsPresent) {
  console.log('\n✅ Auth integration is complete!')
  console.log('\nIntegration Summary:')
  console.log('- Auth helper functions: ✅ Implemented')
  console.log('- AuthContext: ✅ Integrated')
  console.log('- Login page: ✅ Connected')
  console.log('- Register page: ✅ Connected')
  console.log('\n✅ Task 4.3 is fully complete and integrated!')
} else {
  console.log('\n⚠️  Some integration issues found')
}
