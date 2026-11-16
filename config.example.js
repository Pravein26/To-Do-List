/**
 * CONFIGURATION TEMPLATE FOR LOCAL OFFLINE DEVELOPMENT
 * 
 * Instructions:
 * 1. Copy this file and rename the copy to "config.js" in the same directory.
 * 2. Fill in your Google Apps Script URL and optionally your SHA-256 PIN hash.
 * 3. "config.js" is listed in .gitignore, so it will NEVER be committed or uploaded to GitHub.
 * 
 * Note: When deployed via GitHub Pages, GitHub Actions automatically handles 
 * secret injection using your GitHub Repository Secrets.
 */

window.APP_CONFIG = {
  // Your Google Apps Script Web App URL (e.g. https://script.google.com/macros/s/AKfy.../exec)
  WEB_APP_URL: "",

  // Optional: SHA-256 hash of your 4-digit PIN.
  // Hash for '2000': 81a83544cf93c245178cbc1620030f1123f435af867c79d87135983c52ab39d9
  // If left blank or unset, local testing falls back to the default PIN '2000'.
  PIN_HASH: ""
};
