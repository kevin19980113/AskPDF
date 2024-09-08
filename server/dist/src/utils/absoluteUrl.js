"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.absoluteUrl = absoluteUrl;
function absoluteUrl(path) {
    if (typeof window !== "undefined")
        return path;
    if (process.env.PRODUCTION_URL)
        return `https://${process.env.PRODUCTION_URL}${path}`;
    return `http://localhost:3000${path}`;
}
