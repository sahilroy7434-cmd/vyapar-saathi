// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error('[api:error]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.code || 'internal_error',
    message: err.expose ? err.message : status === 500 ? 'Something went wrong' : err.message,
  });
};
