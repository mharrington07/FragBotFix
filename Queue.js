"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class default_1 {
    constructor() {
        this.array = [];
    }
    push(e) { this.array.push(e); }
    pull() { return this.array.shift(); }
    isEmpty() { return this.array.length == 0; }
    includes(e) { return this.array.includes(e); }
    length() { return this.array.length; }
    peek() { return this.array.length == 0 ? undefined : this.array[0]; }
    splice(e) {
        const index = this.array.indexOf(e);
        if (index == -1) {
            return false;
        }
        this.array.splice(index, 1);
        return true;
    }
}
exports.default = default_1;
//# sourceMappingURL=Queue.js.map