const logger = {
  info(message, meta) {
    console.log(message, meta || "");
  },
  error(error) {
    console.error(error);
  }
};

module.exports = { logger };
