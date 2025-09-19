const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 9000;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'dist', 'index.html');
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h1>Test Server Running!</h1>
            <p>Server is working on port ${PORT}</p>
            <p>Build file not found, but server is accessible.</p>
          </body>
        </html>
      `);
    }
  } else if (req.url.startsWith('/assets/')) {
    const filePath = path.join(__dirname, 'dist', req.url);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      let contentType = 'text/plain';
      
      if (ext === '.css') contentType = 'text/css';
      if (ext === '.js') contentType = 'application/javascript';
      
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Hello! Server is running on port ${PORT}`);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Test server running at http://127.0.0.1:${PORT}/`);
  console.log(`📁 Serving from: ${__dirname}`);
  
  // Try to open browser
  const { exec } = require('child_process');
  exec(`cmd /c start http://127.0.0.1:${PORT}`, (error) => {
    if (error) {
      console.log('Could not auto-open browser, please open manually');
    }
  });
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});