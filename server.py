#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import mimetypes
import threading
import time

PORT = 8888
DIRECTORY = os.path.join(os.getcwd(), 'dist')

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def guess_type(self, path):
        mimetype, encoding = mimetypes.guess_type(path)
        if mimetype is None:
            if path.endswith('.js'):
                mimetype = 'application/javascript'
            elif path.endswith('.css'):
                mimetype = 'text/css'
            elif path.endswith('.html'):
                mimetype = 'text/html'
        return mimetype, encoding

def open_browser():
    time.sleep(2)
    try:
        webbrowser.open(f'http://localhost:{PORT}')
        print(f'✅ Browser opened to http://localhost:{PORT}')
    except Exception as e:
        print(f'Could not auto-open browser: {e}')
        print(f'Please manually open: http://localhost:{PORT}')

def main():
    # Check if dist directory exists
    if not os.path.exists(DIRECTORY):
        print(f'❌ Error: {DIRECTORY} directory not found!')
        print('Please run "npm run build" first to create the dist directory.')
        return
    
    print(f'📁 Serving files from: {DIRECTORY}')
    print(f'🚀 Starting server on http://localhost:{PORT}')
    
    # Start browser opening in background
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Start server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🌐 Server running at http://localhost:{PORT}")
        print(f"📱 Also try: http://127.0.0.1:{PORT}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == "__main__":
    main()