const express = require('express');
const app = express();

// ...existing middleware, route registration, etc. ...

// Only start the HTTP server when not running tests so Supertest can import the app.
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

module.exports = app;