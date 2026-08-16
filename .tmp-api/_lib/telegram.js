"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyInitData = verifyInitData;
exports.extractInitData = extractInitData;
const crypto_1 = __importDefault(require("crypto"));
// Проверка подписи initData по алгоритму Telegram WebApp.
function verifyInitData(initData, botToken) {
    try {
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        if (!hash)
            return null;
        params.delete('hash');
        const dataCheck = [...params.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join('\n');
        const secret = crypto_1.default.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const computed = crypto_1.default.createHmac('sha256', secret).update(dataCheck).digest('hex');
        if (computed !== hash)
            return null;
        const authDate = Number(params.get('auth_date') || '0');
        if (authDate && Date.now() / 1000 - authDate > 86400)
            return null;
        const userRaw = params.get('user');
        const user = userRaw ? JSON.parse(userRaw) : {};
        return { id: Number(user.id), first_name: user.first_name, last_name: user.last_name, username: user.username };
    }
    catch {
        return null;
    }
}
function extractInitData(req) {
    const auth = req.headers['authorization'] || '';
    if (auth.startsWith('Bearer '))
        return auth.slice(7);
    return null;
}
