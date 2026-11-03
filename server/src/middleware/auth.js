import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vaagai_super_secret_jwt_key_2026_artisanal_sarees_heritage';

const ADMIN_ROLES = ['admin', 'super_admin', 'product_manager', 'order_manager', 'content_manager', 'support'];

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
 * Middleware: Enforces that req.user has an administrative or staff role.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Administrative privileges required for this action.',
    });
  }
  next();
}

/**
 * Role-Based Access Control Middleware
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // super_admin always has access
    if (req.user.role === 'super_admin' || req.user.role === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Your role (${req.user.role}) does not have permission for this resource.`,
      });
    }

    next();
  };
}

export default {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireRole,
};
