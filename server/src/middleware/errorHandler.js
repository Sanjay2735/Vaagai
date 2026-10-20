/**
 * Global Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('[Unhandled Server Error]:', err);

  // PostgreSQL Unique Constraint Violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with this information already exists.',
      detail: err.detail,
    });
  }

  // PostgreSQL Foreign Key Violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced entity does not exist.',
      detail: err.detail,
    });
  }

  // PostgreSQL Check Constraint Violation
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Provided value violates database validation rules.',
      detail: err.detail,
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}
