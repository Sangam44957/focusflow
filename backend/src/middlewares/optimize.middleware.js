// backend/src/middlewares/optimize.middleware.js

export const optimizeResponse = (req, res, next) => {
  // Remove unnecessary headers
  res.removeHeader('X-Powered-By');
  
  // Add performance headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  
  // Cache static assets
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  next();
};