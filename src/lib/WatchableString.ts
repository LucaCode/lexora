import { EventEmitter } from "emitix";
import { LexoraContext } from "./LexoraContext";

export class WatchableString<T = LexoraContext> extends EventEmitter.Protected<{
    update: [string],
    error: [Error],
}> {
    private _value: string;
    private _updater: (context: T) => string;

    constructor(value: string, updater: (context: T) => string) {
        super();
        this._value = value;
        this._updater = updater;
    }

    /**
     * @internal
     */
    _update(context: T) {
        try {
            const newValue = this._updater(context);
            if (newValue !== this._value) {
                this._value = newValue;
                this.emit("update", this._value);
            }
        }
        catch (error) { 
            this.emit("error", error instanceof Error ? error : new Error(String(error)));
        }
    }

    get value() {
        return this._value;
    }
}