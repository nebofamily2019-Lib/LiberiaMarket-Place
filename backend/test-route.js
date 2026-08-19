const app = require('./src/server');

// Print all registered routes
function printRoutes(routes, prefix = '') {
  routes.forEach(route => {
    if (route.route) {
      const methods = Object.keys(route.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${prefix}${route.route.path}`);
    } else if (route.name === 'router') {
      if (route.regexp) {
        const path = route.regexp.toString()
          .replace('/^\', '')
          .replace('\/?(?=\/|$)/i', '')
          .replace(/\\//g, '/');
        printRoutes(route.handle.stack, prefix + (path === '' ? '' : path));
      }
    }
  });
}

console.log('\n=== Registered Routes ===');
printRoutes(app._router.stack.filter(r => r.route || r.name === 'router'));
process.exit(0);
