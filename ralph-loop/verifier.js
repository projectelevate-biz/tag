/**
 * Playwright Verification Helpers for Ralph Loop Tasks
 *
 * This module provides helper functions to verify b2b-boilerplate functionality
 * using Playwright during task execution.
 *
 * Usage in Claude:
 * 1. Add at top of response: const verifier = require('./ralph-loop/verifier.js');
 * 2. Use functions to verify features
 * 3. Call verifier.complete() when all verifications pass
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class PlaywrightVerifier {
  constructor() {
    this.browser = null;
    this.page = null;
    this.errors = [];
  }

  async init(options = {}) {
    const config = {
      headless: options.headless !== undefined ? options.headless : false,
      slowMo: options.slowMo || 50,
      timeout: options.timeout || 30000,
    };

    this.browser = await chromium.launch({
      headless: config.headless,
      slowMo: config.slowMo,
    });

    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(config.timeout);

    return this;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async goto(url) {
    try {
      await this.page.goto(url);
      this.log(`Navigated to: ${url}`);
      return true;
    } catch (error) {
      this.error(`Failed to navigate to ${url}: ${error.message}`);
      return false;
    }
  }

  async fillForm(selector, values) {
    try {
      for (const [field, value] of Object.entries(values)) {
        await this.page.fill(selector, value);
      }
      this.log(`Filled form ${selector}`);
      return true;
    } catch (error) {
      this.error(`Failed to fill form ${selector}: ${error.message}`);
      return false;
    }
  }

  async click(selector, options = {}) {
    try {
      await this.page.click(selector, options);
      this.log(`Clicked: ${selector}`);
      return true;
    } catch (error) {
      this.error(`Failed to click ${selector}: ${error.message}`);
      return false;
    }
  }

  async waitForSelector(selector, options = {}) {
    try {
      await this.page.waitForSelector(selector, options);
      this.log(`Found element: ${selector}`);
      return true;
    } catch (error) {
      this.error(`Element not found: ${selector}`);
      return false;
    }
  }

  async waitForText(selector, text, options = {}) {
    try {
      await this.page.waitForFunction(
        (sel, txt) => {
          const el = document.querySelector(sel);
          return el && el.textContent.includes(txt);
        },
        { selector, text },
        options
      );
      this.log(`Found text "${text}" in ${selector}`);
      return true;
    } catch (error) {
      this.error(`Text "${text}" not found in ${selector}`);
      return false;
    }
  }

  async screenshot(filename) {
    const screenshotPath = path.join(__dirname, 'screenshots', filename);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.log(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  async isVisible(selector) {
    try {
      const isVisible = await this.page.isVisible(selector);
      this.log(`${selector} is ${isVisible ? 'visible' : 'not visible'}`);
      return isVisible;
    } catch {
      this.error(`Could not check visibility for ${selector}`);
      return false;
    }
  }

  async getText(selector) {
    try {
      const text = await this.page.textContent(selector);
      this.log(`Got text from ${selector}: ${text?.trim().substring(0, 50)}`);
      return text?.trim();
    } catch (error) {
      this.error(`Failed to get text from ${selector}: ${error.message}`);
      return null;
    }
  }

  async getAttribute(selector, attribute) {
    try {
      const attr = await this.page.getAttribute(selector, attribute);
      this.log(`Got attribute ${attribute} from ${selector}: ${attr}`);
      return attr;
    } catch (error) {
      this.error(`Failed to get attribute ${attribute} from ${selector}: ${error.message}`);
      return null;
    }
  }

  // ========== VERIFICATION HELPERS ==========

  /**
   * Verify the page title matches expected text
   */
  async verifyTitle(expectedTitle) {
    const actualTitle = await this.page.title();
    if (actualTitle.includes(expectedTitle)) {
      this.log(`✓ Title verification passed: "${actualTitle}"`);
      return true;
    } else {
      this.error(`✗ Title verification failed. Expected "${expectedTitle}", got "${actualTitle}"`);
      return false;
    }
  }

  /**
   * Verify an element contains specific text
   */
  async verifyContainsText(selector, expectedText) {
    const text = await this.page.textContent(selector);
    if (text && text.includes(expectedText)) {
      this.log(`✓ "${selector}" contains "${expectedText}"`);
      return true;
    } else {
      this.error(`✗ "${selector}" does not contain "${expectedText}"`);
      return false;
    }
  }

  /**
   * Verify input has a specific value
   */
  async verifyInputValue(selector, expectedValue) {
    const value = await this.page.getAttribute(selector, 'value');
    if (value === expectedValue) {
      this.log(`✓ Input "${selector}" has value "${expectedValue}"`);
      return true;
    } else {
      this.error(`✗ Input "${selector}" has value "${value}", expected "${expectedValue}"`);
      return false;
    }
  }

  /**
   * Verify current URL matches a pattern
   */
  async verifyUrl(pattern) {
    const url = this.page.url();
    if (url.includes(pattern)) {
      this.log(`✓ URL matches pattern: ${url}`);
      return true;
    } else {
      this.error(`✗ URL "${url}" does not match pattern "${pattern}"`);
      return false;
    }
  }

  /**
   * Verify an element is visible
   */
  async verifyVisible(selector) {
    const visible = await this.isVisible(selector);
    if (visible) {
      this.log(`✓ Element "${selector}" is visible`);
      return true;
    } else {
      this.error(`✗ Element "${selector}" is not visible`);
      return false;
    }
  }

  /**
   * Check if element exists (may or may not be visible)
   */
  async exists(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      this.log(`✓ Element "${selector}" exists`);
      return true;
    } catch {
      this.log(`✗ Element "${selector}" does not exist`);
      return false;
    }
  }

  /**
   * Count number of elements matching selector
   */
  async countElements(selector) {
    const count = await this.page.locator(selector).count();
    this.log(`Found ${count} elements matching "${selector}"`);
    return count;
  }

  /**
   * Verify at least N elements match selector
   */
  async verifyMinElements(selector, min) {
    const count = await this.countElements(selector);
    if (count >= min) {
      this.log(`✓ Found ${count} elements (minimum ${min})`);
      return true;
    } else {
      this.error(`✗ Found only ${count} elements (minimum ${min})`);
      return false;
    }
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    try {
      await this.page.waitForLoadState('networkidle');
      this.log('Navigation complete');
      return true;
    } catch (error) {
      this.error(`Navigation verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify user is authenticated (checks for sign-out button or profile link)
   */
  async isAuthenticated() {
    // Check for common indicators of authentication
    const indicators = [
      'a[href="/sign-out"]',
      'button:has-text("Sign out")',
      '[data-testid="user-menu"]',
      'a[href="/profile"]',
      'a[href="/dashboard"]',
    ];

    for (const indicator of indicators) {
      try {
        await this.page.waitForSelector(indicator, { timeout: 2000 });
        this.log(`✓ User appears authenticated (found: ${indicator})`);
        return true;
      } catch {
        // Try next indicator
      }
    }

    this.error('✗ User does not appear to be authenticated');
    return false;
  }

  /**
   * Sign in with test credentials
   */
  async signIn(email, password) {
    try {
      await this.goto('http://localhost:3000/sign-in');

      // Look for email input
      const emailInput = await this.page.waitForSelector('input[type="email"], input[name="email"]');
      await this.page.fill('input[type="email"], input[name="email"]', email);

      // Look for password input
      const passwordInput = await this.page.waitForSelector('input[type="password"], input[name="password"]');
      await this.page.fill('input[type="password"], input[name="password"]', password);

      // Submit form
      await this.page.click('button[type="submit"], button:has-text("Sign"), button:has-text("Log in")');

      // Wait for navigation
      await this.page.waitForLoadState('networkidle');

      this.log(`✓ Signed in as ${email}`);
      return true;
    } catch (error) {
      this.error(`✗ Sign in failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      await this.click('a[href="/sign-out"], button:has-text("Sign out")');
      await this.page.waitForLoadState('networkidle');
      this.log('✓ Signed out');
      return true;
    } catch (error) {
      this.error(`✗ Sign out failed: ${error.message}`);
      return false;
    }
  }

  // ========== LOGGING ==========

  log(message) {
    console.log(`[RALPH] ${message}`);
  }

  error(message) {
    console.error(`[RALPH ERROR] ${message}`);
    this.errors.push(message);
  }

  getErrors() {
    return this.errors;
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Generate completion message for Claude
   */
  complete(taskId) {
    if (this.hasErrors()) {
      return `<ralph-errors>Task ${taskId} has errors:\n${this.errors.join('\n')}\nFix these issues before completing.</ralph-errors>`;
    } else {
      return `<ralph-complete>Task ${taskId} completed successfully. All verifications passed.</ralph-complete>`;
    }
  }
}

/**
 * Quick async helper function
 */
async function verify(config, testFn) {
  const verifier = new PlaywrightVerifier();
  try {
    await verifier.init(config);
    const result = await testFn(verifier);
    await verifier.close();
    return result;
  } catch (error) {
    console.error('Verification error:', error);
    await verifier.close();
    return false;
  }
}

// Export for use
module.exports = PlaywrightVerifier;
module.exports.verify = verify;
