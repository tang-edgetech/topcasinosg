// Startup file for cPanel's Application Manager, which requires app.js — see
// deploy/cpanel/README.md. (CloudLinux "Setup Node.js App" uses server.cjs.)
/* eslint-disable @typescript-eslint/no-require-imports -- plain CommonJS, run directly by Passenger */
require("./server.cjs");
