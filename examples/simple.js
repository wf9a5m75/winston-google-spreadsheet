const REFRESH_TOKEN = 'your_refresh_token';
const CLIENT_ID = 'your_client_id';
const CLIENT_SECRET = 'your_client_secret';
const FILE_ID = 'your_file_id';

var winston = require('winston');
require('winston-google-spreadsheet').GoogleSpreadSheet;

var async = require('async'),
    events = require('events'),
    GoogleTokenProvider = require('refresh-token').GoogleTokenProvider;
    

async.waterfall([
  function(callback) {
    var tokenProvider = new GoogleTokenProvider({
      'refresh_token': REFRESH_TOKEN,
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET
    });
    tokenProvider.getToken(callback);
  },
  
  function(accessToken, callback) {
    var ssLogger = new (winston.transports.GoogleSpreadsheet)({
      'fileId' : FILE_ID,
      'level' : 'info',
      'accessToken': accessToken,
      'refresh_token': REFRESH_TOKEN,
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET
    });
    
    var consoleLogger = new (winston.transports.Console)({
      timestamp: true,
      level : 'info',
      json : true,
      prettyPrint : true,
      colorize : true
    });
    callback(null, [ssLogger, consoleLogger])
  }
], function(err, loggers) {
  var logger = new (winston.Logger)({
    transports: loggers,
    exceptionHandlers: loggers,
    exitOnError: false
  });

  logger.log('info', 'Test Log Message', { anything: 'This is metadata' });
})


