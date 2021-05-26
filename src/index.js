#!/usr/bin/env node
const args = require('minimist')(process.argv.slice(2));
const bartleby = require('./bartleby');
const { serve, ['serve-admin']: serveAdmin } = args;

if (serve) bartleby.serve();
else if (serveAdmin) bartleby.serveAdmin();
else bartleby.build();
