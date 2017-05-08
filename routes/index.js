var ftp = require('ftp');
var url = require('url');
var path = require('path');
var iconv = require('iconv-lite');
var humanize = require('humanize');

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.setLevel('INFO');

var ftpconfig = require('../config/ftpconfig');

var express = require('express');
var router = express.Router();

/* GET page. */
router.get('/*', function(req, res, next) {
  var urlObj = url.parse(decodeURIComponent(req.originalUrl), true);
  logger.debug('url path:', urlObj.pathname, ', url queries:', urlObj.query, 'decode url:', decodeURIComponent(req.originalUrl));

  var client = new ftp();
  client.on('ready', () => {
    logger.debug('ftp client ready');
    var urlType = urlObj.query.type;
    var basename = path.basename(urlObj.pathname);
    logger.debug('url basename:', basename);
    if (!urlType) {
      var extname = path.extname(basename);
      if (!extname) {
        // assume user access a dir on remote ftp
        urlType = 'd';
      }
    }
    if (!urlType || urlType == 'd') {
      client.cwd(urlObj.pathname, (err, cdir) => {
        client.list((err, list) => {
          logger.debug('list:', list);
          list.forEach((fileObj) => {
            fileObj.name = iconv.decode(fileObj.name, 'utf8');
            fileObj.humanizeFileSize = humanize.filesize(fileObj.size);
            fileObj.humanizeDate = humanize.date('Y-m-d H:i:s', fileObj.date)
          });
          // change list to html output
          res.render('index', {
            currDir: urlObj.pathname,
            fileList: list,
          });
          client.end();
        });
      });
    } else if (urlType && urlType == '-') {
      // write res headers for sending file content back
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="' + path.basename(urlObj.pathname) + '"'
      });
      client.get(urlObj.pathname, (err, rstream) => {
        if (!rstream) {
          logger.warn('ftp get file failed:', urlObj.pathname);
          client.end();
          res.end();
          return;
        }
        // read data from rstream
        rstream.once('close', () => {
          logger.debug('file send finished, close ftp client');
          client.end();
          res.end();
        });
        res.once('close', () => {
          logger.debug('response closed, close ftp client too');
          client.end();
        });
        rstream.pipe(res);
      });
    } else {
      client.end();
      res.write('not support type: "' + urlObj.query.type + '"');
      res.end();
    }
  });
  client.on('close', () => {
    logger.debug('ftp client closed');
  });
  client.connect(ftpconfig);
});

module.exports = router;
