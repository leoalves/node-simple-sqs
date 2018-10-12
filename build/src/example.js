"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const main_1 = require("./main");
const manager = new main_1.default({
    ovpnFile: './test.ovpn',
    username: 'username',
    password: 'password',
    onStateChange: state => {
        console.log(state);
        if (state === 'CONNECTED') {
            setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                console.log('after 60 seconds connected - reconnecting');
                yield manager.disconnect();
                yield manager.init();
                yield manager.connect();
            }), 60000);
        }
    }
});
const start = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    yield manager.init();
    yield manager.connect();
});
start().catch(err => {
    console.log(err);
});
//# sourceMappingURL=example.js.map