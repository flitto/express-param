"use strict";

var expresss = require('express')
  , _ = require('lodash/core')
  , request = require('supertest')
  , imsiList = require('../dat/mcc_mnc.json')
  , jsonDiff = require('json-diff').diff
  , fetcher = require('../');

describe('It can ', function() {
  var app
    , mcc = 450
    , mnc = 11
    , expectedList;

  beforeEach(function (done) {
    app = expresss();
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
    var options
      , queryString = 'mcc=' + mcc;

    app.use(function(req, res, next) {
      var required = ['ipaddr'];

      options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      var imsi = req.headers['x-fetcher-imsi'];

      if (jsonDiff(imsi, expectedList)) {
        throw new Error('Not match imsi info!');
      }
      return res.send(options);
    });

    request(app)
      .get('/required?' + queryString)
      .expect(200, done);
  });

  it('fetch imsi info by mcc and mnc', function(done) {
    var options
      , queryString = 'mcc=' + mcc + '&mnc=' + mnc;

    app.use(function(req, res, next) {
      var required = ['ipaddr'];

      options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      expectedList = _.filter(imsiList, function(el) {
        return (el.mcc == mcc && el.mnc == mnc);
      });
      var imsi = req.headers['x-fetcher-imsi'];

      if (jsonDiff(imsi, expectedList)) {
        throw new Error('Not match imsi info!');
      }

      return res.send(options);
    });

    request(app)
      .get('/required?' + queryString)
      .expect(200, done);
  });
});
