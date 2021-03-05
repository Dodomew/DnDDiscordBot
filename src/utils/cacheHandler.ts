interface CacheItem extends JSON {
    cache_timestamp: number;
};

class CacheHandler {
    cache: Map<string, CacheItem>;
    ttl: number;

    constructor() {
        this.cache = new Map();
        //14400000
        this.ttl = 5000;
    }

    get(key: string) {
        return this.cache.get(key);
    }

    has(key: string) {
        return this.cache.has(key);
    }

    set(key: string, value) {
        const valueWithTimeStamp = { ...value, "cache_timestamp": Date.now() };
        return this.cache.set(key, valueWithTimeStamp);
    }

    delete(key: string) {
        return this.cache.delete(key);
    }

    clear() {
        return this.cache.clear();
    }

    isExpired(key: string) {
        const cacheItem = this.cache.get(key);
        if ((Date.now() - cacheItem.cache_timestamp) < this.ttl) {
            return false;
        }
        return true;
    }
}

module.exports = CacheHandler;