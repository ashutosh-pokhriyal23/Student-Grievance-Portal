const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // req.user must be populated by authMiddleware prior to this check
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access denied. User role not determined.' });
    }

    if (allowedRoles.includes(req.user.role)) {
      next(); // Role is authorized
    } else {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to perform this action.' });
    }
  };
};

module.exports = requireRole;
