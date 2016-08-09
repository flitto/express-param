var expresss = require('express')
  , qs = require('querystring')
  , request = require('supertest')
  , fetcher = require('../');

describe('It can ', function() {
  var app;

  beforeEach(function (done) {
    app = expresss();
    //additional custom option
    // key : your key name within http request
    // val : default property of req(express value)
    app.use(fetcher({
      user: 'user',
      ipaddr: 'ip'
    }));
    done();
  });

  it('fetch required Parameters', function(done) {
    var options
      , queryString = 'id=1&type=int';

    app.use(function(req, res, next) {
      var required = ['id', 'type', 'ipaddr'];

      options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/required?' + queryString)
      .expect(function(res) {
        if (res.body.ipaddr.indexOf('::ffff:') < 0)
          res.body.ipaddr = '::ffff:' + res.body.ipaddr;
      })
      .expect(200, qs.parse(queryString + '&ipaddr=::ffff:127.0.0.1'), done);
  });

});
