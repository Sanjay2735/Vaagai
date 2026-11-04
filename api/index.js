import app from '../server/src/app.js';

export default function handler(req, res) {
  // Normalize req.url so Express routes mounted under /api always match
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
