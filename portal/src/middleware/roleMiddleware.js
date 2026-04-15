/**
 * Relaxed Role Middleware for Development. 
 * Allows all authenticated users to pass regardless of their role.
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // req.user must be populated by authMiddleware prior to this check
    if (!req.user) {
      console.warn(`[RoleMiddleware] Access denied for ${req.originalUrl}: User session missing.`);
      return res.status(401).json({ error: 'Access denied. Please login.' });
    }

    // [DEV BYPASS] Automatically allow regardless of role string
    console.log(`[RoleMiddleware] Relaxed matching: User with role "${req.user.role}" accessing "${req.originalUrl}" (Required: ${allowedRoles.join(', ')})`);
    
    // Proceed to next middleware/handler
    next();
  };
};

module.exports = requireRole;
