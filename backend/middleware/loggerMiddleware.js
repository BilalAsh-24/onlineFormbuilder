// middleware/loggerMiddleware.js

export const logger = (req, res, next) => {
  const now = new Date().toLocaleString(); // readable time
  const method = req.method;               // GET, POST, etc.
  const url = req.originalUrl;             // route path
  console.log(`[${now}] ${method} ${url}`);
  next(); // important — moves to the next step
};
