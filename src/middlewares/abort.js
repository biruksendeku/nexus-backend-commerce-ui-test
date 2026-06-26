

// to abort connection when the client disconnects - like closes the tab
// or navigates away
module.exports = function abortSignal(req, res, next) {
  const controller = new AbortController();
  req.signal = controller.signal; // attach to request object

  // listen for client disconnect
  req.on('close', () => {
    if (!res.writableFinished) {
      controller.abort();
    }
  });
  
  next();
};
