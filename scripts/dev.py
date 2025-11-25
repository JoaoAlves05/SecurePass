import http.server
import socketserver
import os
import sys
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from sync_shared import sync_shared_code

PORT = 8000
WEB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web")

class SyncHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith(".js"):
            print(f"\nChange detected in {event.src_path}. Syncing...")
            sync_shared_code()

def run_dev_server():
    # Initial sync
    sync_shared_code()

    # Setup file watcher for extension/src
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    extension_src = os.path.join(project_root, "extension", "src")
    
    observer = Observer()
    observer.schedule(SyncHandler(), extension_src, recursive=False)
    observer.start()

    # Change to web directory to serve files
    os.chdir(WEB_DIR)

    Handler = http.server.SimpleHTTPRequestHandler
    
    print(f"\nStarting development server at http://localhost:{PORT}")
    print(f"Serving files from {WEB_DIR}")
    print("Watching for changes in extension/src...")

    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        observer.stop()
        httpd.shutdown()
    
    observer.join()

if __name__ == "__main__":
    # Install watchdog if not present
    try:
        import watchdog
    except ImportError:
        print("Installing watchdog for file monitoring...")
        os.system(f"{sys.executable} -m pip install watchdog")
        print("Watchdog installed. Restarting...")
        os.execv(sys.executable, ['python3'] + sys.argv)

    run_dev_server()
