const { serve } = require('minimist')(process.argv.slice(2));
const bartleby = require('./bartleby');

if (serve) bartleby.serve();
else  bartleby.build();
