const CACHE_DURATION = 5 * 60 * 1000;

const cache = new Map();

export const apiCache = {
  get: (key) => {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }
    return item.data;
  },

  set: (key, data) => {
    cache.set(key, {
      data,
      expiry: Date.now() + CACHE_DURATION,
    });
  },

  invalidate: (key) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  },

  generateKey: (endpoint, params = {}) => {
    return `${endpoint}:${JSON.stringify(params)}`;
  },
};
