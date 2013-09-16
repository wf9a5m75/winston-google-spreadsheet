var util = require('util'),
    winston = require('winston'),
    request = require('request'),
    data2xml = require('data2xml')(),
    events = require('events'),
    GoogleTokenProvider = require('refresh-token').GoogleTokenProvider,
    GoogleClientLogin = require('googleclientlogin').GoogleClientLogin,
    zoneinfo = require('zoneinfo'),
    TZDate = zoneinfo.TZDate;

const ENTRY_POINT = 'https://spreadsheets.google.com/feeds';

var winstonGoogleSpreadsheet = winston.transports.GoogleSpreadsheet = function (params) {
  var self = this,
      tokenProvider = null,
      googleAuth = null;
      
  self.name = 'winston-google-spreadsheet';
  self.level = params.level || 'info';
  self.fileId = params.fileId || '';
  self.fileId = self.fileId.replace(/#.*$/, '');
  self.sheetIdx = params.sheetIdx || 1;
  self.accessToken = params.accessToken || null;
  self.timezone = params.timezone || null;
  
  self.buffer_ = [];
  self.authHeader_ = null
  self.appCtrl_ = new events.EventEmitter();
  self.appCtrl_.once('auth-updated', self.init_);
  
  params.refreshToken = params.refreshToken || params.refresh_token;
  params.clientId = params.clientId || params.client_id;
  params.clientSecret = params.clientSecret || params.client_secret;
  
  if (params.email && params.password) {
    //------------------------------------------
    // Access with client login
    //------------------------------------------
    googleAuth = new GoogleClientLogin({
      email: params.email,
      password: params.password,
      service: 'spreadsheets',
      accountType: GoogleClientLogin.accountTypes.google
    });
    googleAuth.on(GoogleClientLogin.events.login, function(){
      self.authHeader_ = 'GoogleLogin auth= '+ googleAuth.getAuthId();
      self.appCtrl_.emit('auth-updated', self, params);
    });
    googleAuth.on(GoogleClientLogin.events.error, function (e) {
      console.error(e)
      throw e;
    });
    googleAuth.login();
  } else if (params.refreshToken &&
        params.clientId &&
        params.clientSecret) {
    //------------------------------------------
    // Access with OAuth2 access token
    //------------------------------------------
    tokenProvider = new GoogleTokenProvider({
      'refresh_token': params.refreshToken,
      'client_id': params.clientId,
      'client_secret': params.clientSecret
    });
    
    self.appCtrl_.on('refresh-token', function() {
      
      // Get Access Token for Google Spreadsheet
      tokenProvider.getToken(function(err, accessToken) {
        if (!err) {
          self.accessToken = accessToken;
          self.authHeader_ = 'Bearer '+ accessToken;
          self.appCtrl_.emit('auth-updated', self, params);
          setTimeout(function() {
            self.appCtrl_.emit('refresh-token');
          }, 30 * 60 * 1000);
          
        } else if (self.accessToken) {
          self.appCtrl_.emit('refresh-token');
        } else {
          throw new Error(err)
        }
      });
    })
    
    if (self.accessToken) {
      self.authHeader_ = 'Bearer '+ self.accessToken;
    }
    self.appCtrl_.emit('refresh-token');
  }
  
  self.appCtrl_.on('buffer', function(newData) {
    self.buffer_.push(newData);
    if (!self.authHeader_) {
      return;
    }
    var data = self.buffer_.shift();
    self.appCtrl_.emit('subtmit', self, data);
  });
  self.appCtrl_.on('submit', self.submit_);
  
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(winstonGoogleSpreadsheet, winston.Transport);

winstonGoogleSpreadsheet.prototype.init_ = function(self, params) {
  if (self.buffer_.length) {
    self.buffer_.forEach(function(data) {
      self.appCtrl_.emit('submit', self, data);
    })
    self.buffer_.length = 0;
  }
}

winstonGoogleSpreadsheet.prototype.log = function (level, message, meta, callback) {
  var self = this,
      now,
      timestamp;
  
  if (!self.fileId) {
    return callback(null, false);
  }
  
  if (self.timezone) {
    now = new TZDate();
    now.setTimezone(self.timezone);
    timestamp = now.format('m/d/Y H:i:s')
  } else {
    now = new Date();
    timestamp = (now.getMonth() + 1) + '/' +
                 now.getDate() + '/' +
                 now.getFullYear() + ' ' + 
                 now.getHours() + ':' +
                 now.getMinutes() + ':' + 
                 now.getSeconds()
  }
  
  if (meta && typeof meta === 'object') {
    meta = JSON.stringify(meta);
  }
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }
  
  var data = {
        _attr: {
          'xmlns' : "http://www.w3.org/2005/Atom",
          'xmlns:gsx': "http://schemas.google.com/spreadsheets/2006/extended",
        },
        'gsx:level': level,
        'gsx:timestamp': timestamp
    };
  if (meta) {
    data['gsx:meta'] = meta
  }
  if (message) {
    data['gsx:message'] = message
  }
  if (!self.authHeader_ || self.buffer_.length) {
    self.appCtrl_.emit('buffer', data);
  } else {
    self.appCtrl_.emit('submit', self, data);
  }
  return callback(null, true);
};

winstonGoogleSpreadsheet.prototype.submit_ = function (self, data) {
  if (!self.authHeader_) {
    self.appCtrl_.emit('buffer', data);
    return;
  }
  
  var dataXML = data2xml('entry', data);
  request.post('https://spreadsheets.google.com/feeds/list/' + self.fileId + '/' + self.sheetIdx + '/private/full?alt=json', {
    'headers' : {
      'Authorization': self.authHeader_,
      'Content-Type': 'application/atom+xml'
    },
    'body': dataXML
  }, function(err, response, body) {
    if (err) {
      console.error(err)
    }
  })
};

