// Startup file for cPanel's "Setup Node.js App" — see deploy/cpanel/README.md.
// Locally, keep using npm run dev / npm start.
/* eslint-disable @typescript-eslint/no-require-imports -- plain CommonJS, run directly by Passenger */
require("../deploy/cpanel/next-server.cjs")({ dir: __dirname, next: require("next") });
