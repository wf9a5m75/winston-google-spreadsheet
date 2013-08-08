const EMAIL = 'your@gmail.com';
const PASSWORD = 'your_password';
const FILE_ID = 'your_file_id';

var winston = require('winston');
require('winston-google-spreadsheet').GoogleSpreadSheet;

var ssLogger = new (winston.transports.GoogleSpreadsheet)({
      'email': EMAIL,
      'password': PASSWORD,
      'fileId' : FILE_ID,
      'level' : 'info'
    });

var logger = new (winston.Logger)({
  'transports': [ssLogger],
  'exceptionHandlers': [ssLogger],
  'exitOnError': true
});

logger.log('info', 'Test Log Message', { anything: 'This is metadata' });