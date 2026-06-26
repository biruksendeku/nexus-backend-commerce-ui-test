

// Create the function
const timeout = (req, res, next) => {
  // Set a timer that will respond if nothing else does
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      // Abort the underlying request (stops any pending DB/fetch work)
      req.destroy();

      // Send json response
      res.status(504).json({
        error: 'Request Timeout',
        message: 'The server took too long to respond. Please try again.',
        refreshUrl: req.originalUrl // for refresh link
      });
    }
  }, Number(process.env.TIMEOUT_MS));

  // Clear the timer if the request finishes normally
  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));

  next();
};


// export the function
module.exports = timeout;
