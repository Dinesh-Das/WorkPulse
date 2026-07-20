# WorkPulse - Personal Work Initiative Tracker

A complete, production-ready desktop application for tracking professional tasks and initiatives. Built with React, Vite, and Electron.

## Features
- **Local Sovereignty**: All data is stored locally on your machine. No cloud required.
- **Project Tracking**: Manage high-level initiatives with stakeholders and business impact.
- **Task Management**: Kanban board and List views with Priority levels (Low to Critical).
- **Secure Architecture**: Uses Electron IPC with context isolation and sandboxing.
- **Export/Import**: Full JSON backup support and Excel data export.
- **Offline First**: Works entirely without an internet connection.

## Prerequisites
- Node.js (v18 or higher)
- Windows OS (for `.exe` packaging)

## Installation & Setup
1. Clone or download the project.
2. Run `npm install` to install all dependencies.

## Development Commands
- **Start Dev Server**: `npm run dev`
  - This launches Vite and Electron concurrently.
  - Changes in React will hot-reload in the Electron window.

## Production Build & Packaging
1. **Build Assets**: `npm run build`
2. **Package Application**: `npm run package`
   - Generates a local executable in the `out/` folder.
3. **Make Installer**: `npm run make`
   - Generates a Windows `.exe` installer (Squirrel.Windows).

## Storage Options
On first launch, you will be prompted to choose:
1. **Recommended**: Standard OS application data folder.
2. **Custom**: Pick any folder (useful for Dropbox/OneDrive syncing).
3. **Portable**: Keeps data in a folder beside the executable.

## Security Architecture
WorkPulse follows Electron security best practices:
- **Context Isolation**: React cannot access Node.js globals directly.
- **Preload Script**: Only specific, safe APIs are exposed to the UI layer.
- **Atomic Writes**: Data is written to temporary files before replacement to prevent corruption.

## Troubleshooting
- **Build Errors**: Ensure `node_modules` is clean and all Electron dependencies are installed.
- **Permission Denied**: Run the terminal with administrative privileges if choosing a protected custom folder for storage.
