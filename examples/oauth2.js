const REFRESH_TOKEN = 'your_refresh_token';
const CLIENT_ID = 'your_client_id';
const CLIENT_SECRET = 'your_client_secret';
const FILE_ID = 'your_file_id';

var winston = require('winston');
require('winston-google-spreadsheet').GoogleSpreadSheet;

var ssLogger = new (winston.transports.GoogleSpreadsheet)({
  'fileId' : FILE_ID,
  'level' : 'info',
  'refreshToken': REFRESH_TOKEN,
  'clientId': CLIENT_ID,
  'clientSecret': CLIENT_SECRET
});
  
var logger = new (winston.Logger)({
  'transports': [ssLogger],
  'exceptionHandlers': [ssLogger],
  'exitOnError': true
});

logger.log('info', 'Test Log Message', { anything: 'This is metadata' });

