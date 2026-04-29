function getHealthStatus() {
  return {
    timestamp: new Date().toISOString()
  };
}

module.exports = { getHealthStatus };
