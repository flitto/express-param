'use strict';

var express = require('express')
  , _ = require('lodash/core')
  , request = require('supertest')
  , imsiList = require('../dat/mcc_mnc.json')
  , fetcher = require('../');

describe('It can ', function() {
  var app
    , mcc = 450
    , mnc = 11
    , expectedList;

  beforeEach(function (done) {
    app = express();
    //additional custom option
    // key : your key name within http request
    // val : default property of req(express value)
    app.use(fetcher({
      user: 'user',
      ipaddr: 'ip'
    }, {imsi: true}));

    expectedList = _.filter(imsiList, function(el) {
      return el.mcc == mcc;
    });
    done();
  });

  it('fetch imsi info by mcc', function(done) {
    app.use(function(req, res, next) {
      var required = ['ipaddr']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      var imsi = req.headers['x-fetcher-imsi'];

      if (!_.isEqual(imsi, expectedList)) {
        throw new Error('Not match imsi info!');
      }
      return res.send(options);
    });

    request(app)
      .get('/required')
      .query('mcc=' + mcc)
      .expect(200, done);
  });

  it('fetch imsi info by mcc and mnc', function(done) {
    app.use(function(req, res, next) {
      var required = ['ipaddr']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      expectedList = _.filter(imsiList, function(el) {
        return (el.mcc == mcc && el.mnc == mnc);
      });
      var imsi = req.headers['x-fetcher-imsi'];

      if (!_.isEqual(imsi, expectedList)) {
        throw new Error('Not match imsi info!');
      }

      return res.send(options);
    });

    request(app)
      .get('/required')
      .query('mcc=' + mcc)
      .query('mnc=' + mnc)
      .expect(200, done);
  });

  it('fetch access country from remote ip address after apply "imsi" additional options', function(done) {
    var extraOption = {'access-country': true};
    app.use(fetcher(extraOption));

    app.use(function(req, res, next) {
      var options = req.fetchParameter([], ['ipaddr', 'access-country']);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options['access-country']);
    });

    request(app)
      .get('/imsi')
      .query('mcc=450')
      .query('mnc=2')
      .expect(200, 'KR', done);
  });
});
