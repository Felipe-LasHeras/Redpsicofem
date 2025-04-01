const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`👈 Request: ${req.method} ${req.url} ${JSON.stringify(req.body)}`)
    const start = Date.now()
    // 'finish' event is emitted when the response has been sent
    res.on('finish', () => {
      const duration = Date.now() - start
      console.log(`👉 Response: ${res.statusCode} ${res.statusMessage}; ${duration}ms`)
    })
  }
  next()
}

module.exports = {
  requestLogger
};