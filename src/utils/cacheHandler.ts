class CacheHandler {
    cache: Map<string, any>;
    ttl: number;

    constructor() {
        this.cache = new Map();
        //14400000
        this.ttl = 5000;
    }

    get(key: string) {
        console.log(`get ${key}`)
        return this.cache.get(key);
    }

    has(key: string) {
        return this.cache.has(key);
    }

    set(key: string, value) {
        const valueWithTimeStamp = { ...value, "timestamp": Date.now() };
        console.log(`setting ${key}`)
        return this.cache.set(key, valueWithTimeStamp);
    }

    delete(key: string) {
        console.log(`deleting ${key}`)
        return this.cache.delete(key);
    }

    clear() {
        return this.cache.clear();
    }

    isExpired(key: string) {
        console.log("is expired?")
        const cacheItem = this.cache.get(key);
        if ((Date.now() - cacheItem.timestamp) < this.ttl) {
            console.log('false')
            return false;
        }
        console.log('true')
        return true;
    }
}

module.exports = CacheHandler;