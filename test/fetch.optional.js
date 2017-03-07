'use strict';

var express = require('express')
  , request = require('supertest')
  , fetcher = require('../');

describe('It can ', function() {
  var app;

  beforeEach(function(done) {
    app = express();
    app.use(fetcher());
    done();
  });

  it('fetch optional parameters', function(done) {
    app.get('/path', function(req, res, next) {
      var required = ['id']
        , optional = ['count']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('id=1')
      .query('count=20')
      .expect(200, {id: '1', count: '20'}, done);
  });

  it('fetch optional parameters with type', function(done) {
    app.get('/path', function(req, res, next) {
      var required = []
        , optional = ['int:count', 'order']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('count=10')
      .query('order=desc')
      .expect(200, {count: 10, order: 'desc'},done);
  });

  it('fetch optional parameters with defaultValue', function(done) {
    app.get('/path', function(req, res, next) {
      var required = []
        , optional = ['number:count', 'order', 'val|=10']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('count=10')
      .query('order=asc')
      .expect(200, {count: 10, order: 'asc', val: '10'},done);
  });

  it('fetch optional parameters with defaultValue and type', function(done) {
    app.get('/path', function(req, res, next) {
      var required = []
        , optional = ['number:count', 'order', 'number:val|=10']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('count=10')
      .query('order=desc')
      .expect(200, {count: 10, order: 'desc', val: 10}, done)
  });

  it('fetch optional parameters input blank string', function(done) {
    app.get('/path', function(req, res, next) {
      var required = []
        , optional = ['number:id|=10']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('id=')
      .expect(200, {id: 10}, done);
  });

  it('fetch optional parameters input number 0', function(done) {
    app.get('/path', function(req, res, next) {
      var required = []
        , optional = ['number:id|=10', 'string:type']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('id=0')
      .query('type=number')
      .expect(200, {id: 0, type: 'number'}, done);
  });

  it('fetch optional parameters blank string', function(done) {
    app.get('/path', function(req, res, next) {
      var required = []
        , optional = ['number:id|=10', 'string:type']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('id=0')
      .query('type=')
      .expect(200, {id: 0, type: ''}, done);
  });

  it('fetch optional parameters with multiple values', function(done) {
    app.get('/path', function(req, res, next) {
      var required = ['string:name']
        , optional = ['number:id|=10', 'string:type'];

      var options = req.fetchParameter(required, optional);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('id=1')
      .query('type=number')
      .query('id=2')
      .query('name=first')
      .query('name=second')
      .expect(200, {name: 'second', id: 2, type: 'number'}, done);
  });
});
