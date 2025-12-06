(() => {
  if (typeof DataTransfer === "undefined") return;

  const cache = new WeakMap();
  const ensure = (dt) => {
    let store = cache.get(dt);
    if (!store) {
      store = {};
      cache.set(dt, store);
    }
    return store;
  };

  const origSet = DataTransfer.prototype.setData;
  const origGet = DataTransfer.prototype.getData;
  const origClear = DataTransfer.prototype.clearData;

  DataTransfer.prototype.setData = function (type, value) {
    ensure(this)[type] = value;
    try {
      return origSet.call(this, type, value);
    } catch (err) {
      if (type !== "text/plain" && err instanceof DOMException) {
        return origSet.call(this, "text/plain", value);
      }
      throw err;
    }
  };

  DataTransfer.prototype.getData = function (type) {
    const store = cache.get(this);
    if (store && Object.prototype.hasOwnProperty.call(store, type)) {
      return store[type];
    }
    try {
      return origGet.call(this, type);
    } catch (err) {
      if (type !== "text/plain" && err instanceof DOMException) {
        return origGet.call(this, "text/plain");
      }
      throw err;
    }
  };

  if (origClear) {
    DataTransfer.prototype.clearData = function (type) {
      if (type) {
        const store = cache.get(this);
        if (store) delete store[type];
      } else {
        cache.delete(this);
      }
      try {
        return origClear.call(this, type);
      } catch (err) {
        if (!(err instanceof DOMException)) throw err;
      }
    };
  }
})();
