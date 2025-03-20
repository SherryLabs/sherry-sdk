// Para Node < 18
if (!global.fetch) {
    global.fetch = require('node-fetch');
}
