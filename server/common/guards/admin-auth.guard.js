"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const SESSION_SECRET = 'xtool-admin-session-a7f3b9c2e1d4';
function verifySessionToken(token) {
    try {
        const decoded = Buffer.from(token, 'base64url').toString('utf-8');
        const parts = decoded.split('|');
        if (parts.length !== 3)
            return { valid: false };
        const [username, expiresStr, sig] = parts;
        const expiresAt = Number(expiresStr);
        if (!expiresAt || Date.now() > expiresAt)
            return { valid: false };
        const payload = `${username}|${expiresAt}`;
        const expected = (0, crypto_1.createHmac)('sha256', SESSION_SECRET).update(payload).digest('base64url');
        if (sig !== expected)
            return { valid: false };
        return { valid: true, username };
    }
    catch {
        return { valid: false };
    }
}
exports.AdminAuthGuard = class AdminAuthGuard {
    logger = new common_1.Logger('AdminAuthGuard');
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['x-admin-token'];
        if (!token) {
            throw new common_1.ForbiddenException('未登录或登录已过期');
        }
        const result = verifySessionToken(token);
        if (!result.valid) {
            throw new common_1.ForbiddenException('未登录或登录已过期');
        }
        request.user = result;
        return true;
    }
};
