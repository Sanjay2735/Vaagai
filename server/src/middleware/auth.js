import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vaagai_super_secret_jwt_key_2026_artisanal_sarees_heritage';

/**
 * Middleware: Requires a valid JWT token in Authorization header.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message,
    });
  }
}

/**
 * Middleware: Optional authentication. If token is provided, populates req.user.
 * If absent, req.user is null, allowing guest checkout or public actions.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    req.user = null;
  }
  next();
}

/**
 * Middleware: Enforces that req.user has an 'admin' role.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges required for this action.',
    });
  }
  next();
}

export default {
  authenticateToken,
  optionalAuth,
  requireAdmin,
};
