/**
 * Ralph Loop Verification Examples
 *
 * Copy these examples into your Claude prompts to verify task completion
 */

// Example 1: Basic Page Load Verification
async function verifyPageLoad() {
  const verifier = require('./verifier.js');
  const v = new verifier();

  await v.init({ headless: false });
  await v.goto('http://localhost:3000');

  // Check page loaded
  const hasContent = await v.verifyContainsText('body', 'Sign in');

  await v.close();
  return v.complete('task-id');
}

// Example 2: Sign-In Flow Verification
async function verifySignIn() {
  const verifier = require('./verifier.js');
  const v = new verifier();

  await v.init({ headless: false });

  // Navigate to sign in
  await v.goto('http://localhost:3000/sign-in');
  await v.verifyVisible('input[type="email"]');

  // Check for Google OAuth button
  const hasGoogleBtn = await v.verifyContainsText('button', 'Google');

  await v.close();
  return v.complete('task-id');
}

// Example 3: Form Submission Verification
async function verifyProfileForm() {
  const verifier = require('./verifier.js');
  const v = new verifier();

  await v.init({ headless: false });

  // Go to profile page
  await v.goto('http://localhost:3000/rebound/profile');

  // Check form fields exist
  await v.exists('input[name="headline"]');
  await v.exists('textarea[name="bio"]');
  await v.exists('input[name="location"]');

  // Check expertise tags section
  await v.verifyContainsText('.expertise-section', 'Areas of Expertise');

  await v.close();
  return v.complete('task-id');
}

// Example 4: Search Functionality Verification
async function verifySearch() {
  const verifier = require('./verifier.js');
  const v = new verifier();

  await v.init({ headless: false });

  await v.goto('http://localhost:3000/relay/search');

  // Enter search term
  await v.fill('input[placeholder*="search"]', 'admissions');

  // Click search button
  await v.click('button:has-text("Search")');

  // Wait for results
  await v.waitForSelector('.consultant-card', { timeout: 10000 });

  // Verify results shown
  const hasResults = await v.verifyMinElements('.consultant-card', 1);

  await v.close();
  return v.complete('task-id');
}

// Example 5: Contact Form Verification
async function verifyContactForm() {
  const verifier = require('./verifier.js');
  const v = new verifier();

  await v.init({ headless: false });

  await v.goto('http://localhost:3000/relay/consultants/test-consultant');

  // Click contact button
  await v.click('button:has-text("Contact")');

  // Verify contact form appears
  await v.verifyVisible('form');
  await v.exists('input[name="senderName"]');
  await v.exists('input[name="subject"]');
  await v.exists('textarea[name="message"]');

  await v.close();
  return v.complete('task-id');
}

// Example 6: Full Task Verification (Complete Flow)
async function verifyCompleteEngagementFlow() {
  const verifier = require('./verifier.js');
  const v = new verifier();

  await v.init({ headless: false, slowMo: 100 });

  try {
    // Step 1: Navigate to search
    await v.goto('http://localhost:3000/relay/search');
    await v.log('Step 1: Navigated to search page');

    // Step 2: Search for consultant
    await v.fill('input[placeholder*="search"]', 'Sarah');
    await v.click('button:has-text("Search")');
    await v.waitForSelector('.consultant-card', { timeout: 5000 });
    await v.log('Step 2: Search completed');

    // Step 3: View consultant profile
    await v.click('.consultant-card:first-child a');
    await v.waitForNavigation();
    await v.log('Step 3: Viewing consultant profile');

    // Step 4: Click contact button
    await v.click('button:has-text("Contact")');
    await v.log('Step 4: Contact form opened');

    // Step 5: Fill and submit contact form
    await v.fill('input[name="senderName"]', 'Test User');
    await v.fill('input[name="senderEmail"]', 'test@example.com');
    await v.fill('input[name="subject"]', 'Test Inquiry');
    await v.fill('textarea[name="message"]', 'This is a test inquiry message.');
    await v.click('button[type="submit"]');
    await v.log('Step 5: Contact form submitted');

    // Step 6: Verify success message
    await v.waitForText('body, [role="alert"]', 'success', { timeout: 5000 });
    await v.log('Step 6: Success! Inquiry created');

    await v.close();
    return '<ralph-complete>All engagement flow verifications passed. Task completed successfully.</ralph-complete>';

  } catch (error) {
    await v.screenshot('error.png');
    await v.close();
    return `<ralph-errors>Engagement flow failed: ${error.message}</ralph-errors>`;
  }
}

// Example 7: Database Verification (via API)
async function verifyDatabaseTables() {
  const fetch = require('node-fetch'); // or use built-in fetch in Node 18+

  try {
    // This would require proper auth headers
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();

    if (data.database === 'connected') {
      return '<ralph-complete>Database connection verified. Task completed successfully.</ralph-complete>';
    } else {
      return '<ralph-errors>Database not connected properly</ralph-errors>';
    }
  } catch (error) {
    return `<ralph-errors>Database verification failed: ${error.message}</ralph-errors>`;
  }
}

// Export all examples
module.exports = {
  verifyPageLoad,
  verifySignIn,
  verifyProfileForm,
  verifySearch,
  verifyContactForm,
  verifyCompleteEngagementFlow,
  verifyDatabaseTables,
};
