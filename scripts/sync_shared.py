import os
import shutil
import sys

def sync_shared_code():
    """
    Syncs the 'src' directory from extension to web.
    This ensures the web demo always runs the exact same logic as the extension.
    """
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    extension_src = os.path.join(project_root, "extension", "src")
    web_src = os.path.join(project_root, "web", "src")

    if not os.path.exists(extension_src):
        print(f"Error: Source directory {extension_src} does not exist.")
        sys.exit(1)

    # Ensure destination exists
    if not os.path.exists(web_src):
        os.makedirs(web_src)

    print(f"Syncing code from {extension_src} to {web_src}...")

    # List of files to sync (or just sync all .js files)
    # We sync everything to be safe, as they are pure logic files.
    for filename in os.listdir(extension_src):
        if filename.endswith(".js"):
            src_file = os.path.join(extension_src, filename)
            dst_file = os.path.join(web_src, filename)
            
            # Read and write to copy
            with open(src_file, 'r') as f_src:
                content = f_src.read()
            
            with open(dst_file, 'w') as f_dst:
                f_dst.write(content)
            
            print(f"  -> Synced {filename}")

    print("Sync complete.")

if __name__ == "__main__":
    sync_shared_code()
