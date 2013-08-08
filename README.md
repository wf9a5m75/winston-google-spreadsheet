# winston-google-spreadsheet

Log data into your Google Spreadsheet with [winston][0]

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

In addition to these, the Redis transport also accepts the following options.

* __refreshToken:__ (Default **None**) Number of log messages to store.
* __clientId:__ (Default **None**) Name of the Redis container you wish your logs to be in.
* __clientSecret:__ (Default **None**) Name of the Redis channel to stream logs from. 

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

*See more detailed explain at http://masashi-k.blogspot.com/2013/08/logging-data-into-google-spreadsheet.html*

#### Author: [Masashi Katsumata](http://masashi-k.blogspot.com/)

[0]: https://github.com/flatiron/winston