export const logger = {
  info(message: string, meta?: unknown) {
    console.log(message, meta ?? "");
  },
  error(error: unknown) {
    console.error(error);
  }
};
