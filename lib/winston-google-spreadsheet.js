var util = require('util'),
    winston = require('winston'),
    request = require('request'),
    data2xml = require('data2xml')();
    

const ENTRY_POINT = 'https://spreadsheets.google.com/feeds';

var winstonGoogleSpreadsheet = winston.transports.GoogleSpreadsheet = function (params) {
  var self = this;
  self.name = 'winston-google-spreadsheet';
  self.level = params.level || 'info';
  self.fileId = params.fileId || '';
  self.sheetIdx = params.sheetIdx || 1;
  self.accessToken = params.accessToken || null;
  
  if (params.refresh_token &&
      params.client_id &&
      params.client_secret) {
    
    var GoogleTokenProvider = require('refresh-token').GoogleTokenProvider;
    
    setInterval(function() {
      // Get Access Token for Google Spreadsheet
      tokenProvider.getToken(function(err, accessToken) {
        if (!err) {
          self.accessToken = accessToken;
        }
      });
    }, 3000 * 1000)
        
  }
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(winstonGoogleSpreadsheet, winston.Transport);

winstonGoogleSpreadsheet.prototype.log = function (level, message, meta, callback) {
  var self = this,
      now = new Date();
  
  if (!self.fileId || !self.accessToken) {
    return callback(null, false);
  }
  
  if (typeof meta === 'object') {
    meta = JSON.stringify(meta);
  }
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }
  
  var data = data2xml('entry', {
        _attr: {
          'xmlns' : "http://www.w3.org/2005/Atom",
          'xmlns:gsx': "http://schemas.google.com/spreadsheets/2006/extended",
        },
        'gsx:level': level,
        'gsx:message': message,
        'gsx:meta': meta,
        'gsx:timestamp': (now.getMonth() + 1) + '/' +
                         now.getDate() + '/' +
                         now.getFullYear() + ' ' + 
                         now.getHours() + ':' +
                         now.getMinutes() + ':' + 
                         now.getMilliseconds()
      });
  
  request.post('https://spreadsheets.google.com/feeds/list/' + self.fileId + '/' + self.sheetIdx + '/private/full?alt=json', {
    'headers' : {
      'Authorization': 'Bearer '+ self.accessToken,
      'Content-Type': 'application/atom+xml'
    },
    'body': data
  }, function(err, response, body) {
    try {
      body = JSON.parse(body)
      callback(null, true);
    } catch(e) {
      callback(e)
    }
  })
};