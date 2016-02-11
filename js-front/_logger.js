function noop() {}
noop.warn = noop;

function logger(name, trace) {
  if (process.env.LOG === true) {
    if (!trace) return noop;
    if (!'console' in window) return noop;
    name = `[${name.toUpperCase()}]`;
    let log =  function log(...args) {
      if (!trace) return;
      args.unshift(name);
      console.log(...args);
    }
    log.warn = function warn (...args) {
      if (!trace) return;
      args.unshift(name);
      console.warn(...args);
    }
    return log;
  } else {
    return noop;
  }
}

export default logger;
