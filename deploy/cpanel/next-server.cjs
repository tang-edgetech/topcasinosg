// Runs a built Next.js app (web or admin) under cPanel's "Setup Node.js App"
// (Phusion Passenger). Passenger starts the app's startup file (web/server.cjs,
// admin/server.cjs) and routes the domain to whatever port it listens on, so
// this is the custom server from Next's docs: production mode, no dev build.
// The app's startup file passes its own require("next") so it resolves from
// that app's node_modules. See deploy/cpanel/README.md.
const { createServer } = require("node:http");

module.exports = function startNextServer({ dir, next }) {
  const port = Number(process.env.PORT) || 3000;
  const app = next({ dev: false, dir });
  const handle = app.getRequestHandler();

  app.prepare().then(
    () => {
      createServer((req, res) => handle(req, res)).listen(port, () => {
        console.log(`> ${dir} ready on port ${port}`);
      });
    },
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
};
