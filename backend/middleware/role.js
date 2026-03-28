const ROLE_PERMISSIONS = {
  'Admin': ['*'],
  'DevOps Engineer': ['workloads', 'metrics', 'optimize', 'reports', 'analytics', 'alerts', 'policies'],
  'Sustainability Officer': ['policies', 'reports', 'dashboard', 'analytics', 'alerts', 'metrics'],
  'Viewer': ['dashboard', 'analytics', 'metrics']
};

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const role = req.user.role;
    if (allowedRoles.includes(role) || role === 'Admin') {
      return next();
    }
    return res.status(403).json({ error: `Access denied for role: ${role}` });
  };
};
