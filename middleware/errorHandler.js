export default function errorHandler(err, req, res, next) {
  // Use existing status code if set, otherwise default to 500
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}
