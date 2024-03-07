const express = require('express');
const path = require('path');
const app = express();
const { exec } = require('child_process');

// Function to open Chrome with a specified URL
function openURLWithChrome(url) {
  // Replace 'chrome' with 'google-chrome' if you're on Linux
  // Replace 'start' with 'open' if you're on macOS
  exec(`open -a "Google Chrome" ${url}`, (err, stdout, stderr) => {
    if (err) {
      console.error('Error opening Chrome:', err);
      return;
    }
    console.log('Chrome opened successfully');
  });
}


// Allow cross-origin requests
app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      // Set Cross-Origin-Opener-Policy header
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      // Set Cross-Origin-Embedder-Policy header
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
});
app.use(express.static(path.join(__dirname, '../')));
// Route to serve your webpage
/*app.get('/', (req, res) => {
      res.send('Your webpage content here');
});*/

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
      console.log(`[server] Server is running on port ${PORT}`);
      console.log("[server] opening web page with chrome...")
      console.log('[server] \x1b[34mhttp://localhost:3000\x1b[0m' );
      openURLWithChrome("http://localhost:3000")
});
