"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_vpn_daemon_1 = require("node-vpn-daemon");
const Telnet = require("telnet-client");
const events_1 = require("events");
const util = require("util");
const waitMS = util.promisify(setTimeout);
class Manager {
    constructor({ ovpnFile = 'test.ovpn', username = 'test', password = 'test', onStateChange = undefined }) {
        this.init = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.destroyListeners();
            this.telnet = new Telnet();
            this.openVpnEmitter = new events_1.EventEmitter();
            if (yield this.Daemon.isRunning()) {
                yield this.Daemon.kill();
            }
            yield this.Daemon.start();
        });
        this.getState = () => {
            console.log(this.stateInterval);
            return this.state;
        };
        this.changeState = (newState) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.state = newState;
            this.openVpnEmitter.emit('state-change');
        });
        this.establishManagerConnection = (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.telnet.connect(Object.assign({ host: '127.0.0.1', port: 1337, shellPrompt: '', timeout: 5000 }, params));
        });
        this.clientPid = () => {
            return this.pid;
        };
        this.managerConnectionReady = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.streamLog();
            yield this.execute('pid');
            yield this.execute('bytecount 1');
            yield this.execute('log on all');
            yield this.execute('state on');
            yield this.execute('hold release');
            yield this.execute(util.format('username "Auth" "%s"', this.username));
            yield this.execute(util.format('password "Auth" "%s"', this.password));
        });
        this.setState = (state) => {
            if (this.state !== state) {
                this.changeState(state);
            }
        };
        this.destroyListeners = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.telnet &&
                this.telnet.removeAllListeners &&
                this.telnet.removeAllListeners();
            this.telnet && this.telnet.hasOwnProperty('end') && this.telnet.end();
            this.telnet &&
                this.telnet.hasOwnProperty('destroy') &&
                this.telnet.destroy();
            this.telnet = false;
            this.openVpnEmitter = false;
        });
        this.connect = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.setListeners();
            yield this.establishManagerConnection();
        });
        this.disconnect = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.execute('signal SIGTERM');
            yield waitMS(1500);
        });
        this.changeIp = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.execute('client-kill ' + this.pid);
            yield waitMS(1500);
            yield this.execute(util.format('username "Auth" "%s"', this.username));
            yield this.execute(util.format('password "Auth" "%s"', this.password));
        });
        this.changeServer = (ovpnFile, credentials) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.disconnect();
            if (credentials) {
                this.username = credentials.username;
                this.password = credentials.password;
            }
            if (ovpnFile) {
                this.ovpnFile = ovpnFile;
            }
            yield this.init();
            yield this.connect();
        });
        this.kill = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.execute('signal SIGTERM');
        });
        this.execute = cmd => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (this.telnet) {
                        this.telnet.exec(cmd, resolve);
                    }
                    else {
                        reject('no telnet instance');
                    }
                }, 1000);
            });
        };
        this.setListeners = () => {
            this.telnet.on('end', () => {
                this.openVpnEmitter.emit('end');
            });
            this.telnet.on('close', () => {
                this.openVpnEmitter.emit('close');
            });
            this.telnet.on('error', error => {
                this.openVpnEmitter.emit('error', error);
            });
            this.telnet.on('ready', this.managerConnectionReady);
            if (this.onStateChange) {
                this.openVpnEmitter.on('state-change', () => {
                    this.onStateChange(this.state);
                });
            }
            if (this.onError) {
                this.openVpnEmitter.on('error', this.onError);
            }
            this.openVpnEmitter.on('pid-set', () => {
                console.log('pid-set: ' + this.pid);
            });
        };
        this.streamLog = () => {
            this.telnet.shell().then(stream => {
                stream.on('data', (data) => {
                    const log = data.toString();
                    log.split('\n').forEach((line) => {
                        if (line.indexOf('pid=') !== -1) {
                            this.pid = parseInt(log.split('pid=')[1].trim());
                            this.openVpnEmitter.emit('pid-set');
                        }
                        if (line.indexOf('>STATE:') !== -1) {
                            const state = line
                                .split('>STATE:')[1]
                                .replace('\n', '')
                                .trim()
                                .split(',');
                            this.setState(state[1]);
                        }
                    });
                });
            });
        };
        this.ovpnFile = ovpnFile;
        this.username = username;
        this.password = password;
        this.Daemon = new node_vpn_daemon_1.default({ ovpnFile: this.ovpnFile });
        this.onStateChange = onStateChange;
        this.telnet = new Telnet();
        this.openVpnEmitter = new events_1.EventEmitter();
        this.pid = undefined;
        this.stateInterval = 0;
    }
}
exports.default = Manager;
//# sourceMappingURL=main.js.map