var express = require('express');
var app = express();

var ping = require('ping');
var wol = require('wake_on_lan');

app.get('/', function(req, res) {
    res.json({});
});

app.get('/con-nas', function(req, res) {
    ping.sys.probe('con-nas.local', function (isAlive) {
        res.json({
            'con-nas': {
                'isAlive' : isAlive
            }
        });
    });
});

app.post('/con-nas', function(req, res) {
    wol.wake('54:04:a6:eb:b9:3d', function(error) {
      if (error) {
        res.json({'error': error});
      } else {
        res.json({'result': 'success'});
      }
    });
});

app.listen(4242);