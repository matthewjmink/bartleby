require('dotenv').config();
const ui = require('./ui');
const cms = require('./cms');

module.exports = {
    serve() {
        ui.serve();
    },
    build() {
        ui.build();
        cms.build();
    }
}
