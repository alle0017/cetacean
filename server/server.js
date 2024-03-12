const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer')
const fs = require('fs');
const app = express();


const newPuppetChrome = async ( url )=>{
    const browser = await puppeteer.launch({ 
      headless: false, 
      devtools: true,
      args:['--start-maximized' ],
      defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto( url );
    fs.watch(path.join(__dirname, '../'), {
      recursive: true,
    }, ()=>{
        page.reload()
    })
    return browser;
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
      console.log(`[server] Server is running on port ${PORT}`);
      console.log("[server] opening web page with chrome...")
      console.log('[server] \x1b[34mhttp://localhost:3000\x1b[0m' );
      newPuppetChrome("http://localhost:3000")
});
