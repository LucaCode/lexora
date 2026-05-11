export class ValueCache<K, V> {
    private _map = new Map<K, V>();

    constructor(
        private readonly _maxSize = 50
    ) { }

    get(key: K): V | undefined {
        const existing = this._map.get(key);

        if (existing !== undefined) {
            // refresh LRU
            this._map.delete(key);
            this._map.set(key, existing);
        }

        return existing;
    }

    set(key: K, value: V): void {
        if (this._map.has(key)) {
            this._map.delete(key);
        }

        this._map.set(key, value);

        if (this._map.size > this._maxSize) {
            const oldestKey =
                this._map.keys().next().value;

            if (oldestKey !== undefined) {
                this._map.delete(oldestKey);
            }
        }
    }

    has(key: K): boolean {
        return this._map.has(key);
    }

    delete(key: K): boolean {
        return this._map.delete(key);
    }

    clear(): void {
        this._map.clear();
    }

    get size(): number {
        return this._map.size;
    }
}