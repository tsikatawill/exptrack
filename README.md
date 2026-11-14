# Money Book

A simple money in / money out tracker that saves to your device (localStorage). Installable as a PWA and works offline.

Live at **https://exptrack.williamtsikata.com**, served by GitHub Pages straight from the `main` branch.

- `index.html`: the whole app
- `manifest.webmanifest`, `icons/`: install metadata and icons
- `sw.js`: service worker that caches the app's files for offline use (it never touches your data). Bump `VERSION` when you change the list of cached files.

On iPhone, the Home Screen app has its own storage, separate from Safari. Use **Back up** in Safari and **Restore** in the installed app to move your entries.
