# winston-google-spreadsheet

Log data into your Google Spreadsheet with [winston][0] logger modules.

## Usage
``` js
  var winston = require('winston');
  
  //
  // Requiring `winston-google-spreadsheet` will expose 
  // `winston.transports.GoogleSpreadsheet`
  //
  require('winston-google-spreadsheet').GoogleSpreadsheet;
  
  winston.add(winston.transports.GoogleSpreadsheet, options);
```

This transport accepts the follow options:

* __fileId:__ (Default **None**) The file ID of Google Spreadsheet that you want to log.
* __sheetIdx:__ (Default **1**) The worksheet index of the file.
* __accessToken:__ (Default **None**) The access token to the file.
* __level:__ (Default **Info**) Level of messages that this transport should log.

In addition for OAuth2, this module also accepts the following options.

* __refreshToken:__ (Default **None**) OAuth2 refresh token.
* __clientId:__ (Default **None**) OAuth2 client ID.
* __clientSecret:__ (Default **None**) OAuth2 client secret.

If you want to use client login, this module also accepts the following options.

* __email:__ (Default **None**) Your gmail address.
* __password:__ (Default **None**) Your gmail password. 

*Metadata:* Logged as JSON literal in cell

*fileId:* A file ID is included in the URL of the file.
![image2](https://github.com/wf9a5m75/winston-google-spreadsheet/raw/master/images/file_id.png)

## Installation

### Installing winston-google-spreadsheet

``` bash
  $ npm install winston
  $ npm install winston-google-spreadsheet
```

### Create a log file
Create a Google Spreadsheet in your Google Drive, then add __timestamp__, __level__, __message__ and __meta__ columns like this image.

![image1](https://github.com/wf9a5m75/winston-google-spreadsheet/raw/master/images/columns.png)

### Client Login

``` js
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
```


### OAuth2

``` js
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
```

*See more detailed explain at http://masashi-k.blogspot.com/2013/08/logging-data-into-google-spreadsheet.html*

#### Author: [Masashi Katsumata](http://masashi-k.blogspot.com/)

[0]: https://github.com/flatiron/winston
[1]: https://github.com/TooTallNate/node-time
