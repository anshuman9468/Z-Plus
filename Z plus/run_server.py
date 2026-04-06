#!/usr/bin/env python
"""
Script to build React app and run Django server
"""
import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
REACT_DIR = BASE_DIR.parent / 'Z+ Website UI Design (1)'

def build_react_app():
    """Build the React application"""
    print("Building React app...")
    os.chdir(REACT_DIR)
    
    # Check if node_modules exists
    if not (REACT_DIR / 'node_modules').exists():
        print("Installing npm dependencies...")
        subprocess.run(['npm', 'install'], check=True)
    
    # Build the app
    print("Running npm build...")
    subprocess.run(['npm', 'run', 'build'], check=True)
    print("React app built successfully!")
    
    # Return to base directory
    os.chdir(BASE_DIR)

def run_django():
    """Run Django development server"""
    print("\nStarting Django server...")
    print("Access the application at: http://localhost:8000")
    subprocess.run([sys.executable, 'manage.py', 'runserver'])

if __name__ == '__main__':
    try:
        # Build React app first
        build_react_app()
        
        # Then run Django
        run_django()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
    except subprocess.CalledProcessError as e:
        print(f"\nError: {e}")
        sys.exit(1)

