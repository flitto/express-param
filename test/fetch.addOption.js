'use strict';

var express = require('express')
  , request = require('supertest')
  , expect = require('chai').expect
  , fetcher = require('../');

describe('It can ', function() {
  var app;

  beforeEach(function (done) {
    app = express();
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
    app.use(function(req, res, next) {
      var required = ['id', 'type', 'ipaddr']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/required')
      .query('id=1&type=int')
      .expect(function(res) {
        if (res.body.ipaddr.indexOf('::ffff:') < 0) res.body.ipaddr = '::ffff:' + res.body.ipaddr;
      })
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({id: '1', type: 'int', ipaddr: '::ffff:127.0.0.1'});
        done();
      });
  });

  it('fetch geographic information from remote ip address(127.0.0.1)', function(done) {
    var options;
    var extraOption = {'geo-info': 'headers.x-fetcher-geoinfo'}
      , addOnOpt = {geoip: {}};

    app.use(fetcher(extraOption, addOnOpt));

    app.use(function(req, res, next) {
      var optional = ['ipaddr', 'geo-info'];
      options = req.fetchParameter([], optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(req.headers['x-fetcher-geoinfo']);
    });

    request(app)
      .get('/')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal(options['geo-info']);
        done();
      });
  });

  it('fetch geographic information from x-forwarded-for header', function(done) {
    var options;
    var extraOption = {'geo-info': 'headers.x-fetcher-geoinfo'}
      , addOnOpt = {geoip: {keyName: 'headers.x-forwarded-for'}};

    app.use(fetcher(extraOption, addOnOpt));

    app.use(function(req, res, next) {
      var optional = ['ipaddr', 'geo-info'];
      options = req.fetchParameter([], optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(req.headers['x-fetcher-geoinfo']);
    });

    request(app)
      .get('/')
      .set('x-forwarded-for', '106.249.137.139, 8.8.8.8') // use 1'st ip if x-forwarded-for is ip list
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal(options['geo-info']);
        expect(res.body.country).to.equal('KR');
        done();
      });
  });

  it('fetch access country from remote ip address', function(done) {
    var extraOption = {ipaddr: 'ip', 'access-country': true}
      , addOnOpt = {geoip: {keyName: 'headers.x-forwarded-for'}};

    app.use(fetcher(extraOption, addOnOpt));

    app.use(function(req, res, next) {
      var options = req.fetchParameter([], ['ipaddr', 'access-country']);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/')
      .set('x-forwarded-for', '106.249.137.139')
      .expect(function(res) {
        if (res.body.ipaddr.indexOf('::ffff:') < 0) res.body.ipaddr = '::ffff:' + res.body.ipaddr;
      })
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({ipaddr: '::ffff:127.0.0.1', 'access-country': 'KR'});
        done();
      });
  });
});
