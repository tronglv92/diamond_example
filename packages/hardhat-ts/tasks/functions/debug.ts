export const DEBUG = true;

export const debugLog = (...args: any[]): void => {
  if (DEBUG) {
    console.log(args);
  }
};
