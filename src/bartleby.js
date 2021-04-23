require('dotenv').config();
const ui = require('./ui');
const cms = require('./cms');

module.exports = {
    serve() {
        ui(true);
    },
    build() {
        ui();
        cms.build();
    }
}
