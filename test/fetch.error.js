'use strict';

var express = require('express')
  , request = require('supertest')
  , fetcher = require('../');

describe('It can ', function() {
  var app;

  beforeEach(function (done) {
    app = express();
    app.use(fetcher());
    done();
  });

  it('receive error code.', function(done) {
    app.get('/path/:id', function(req, res, next) {
      var required = ['{id}', 'type', 'order']
        , options = req.fetchParameter(required, []);

      if (req.checkParamErr(options)) return next(options);

      return res.status(200).send(options);
    });

    app.use(function(err, req, res, next) {
      return res.status(err.code).send(err.message);
    });

    request(app)
      .get('/path/10')
      .expect(400, done);
  });

  it('receive type error code. (required param)', function(done) {
    app.get('/path/:id', function(req, res, next) {
      var required = ['number:id']
        , options = req.fetchParameter(required, []);

      if (req.checkParamErr(options)) return next(options);

      return res.status(200).send(options);
    });

    app.use(function(err, req, res, next) {
      return res.status(err.code).send(err.message);
    });

    request(app)
      .get('/path/ten')
      .expect(400, done);
  });

  it('receive type error code. (required param)', function(done) {
    app.get('/path/:id', function(req, res, next) {
      var required = ['int:{id}']
        , options = req.fetchParameter(required, []);

      if (req.checkParamErr(options)) return next(options);

      return res.status(200).send(options);
    });

    app.use(function(err, req, res, next) {
      return res.status(err.code).send(err.message);
    });

    request(app)
      .get('/path/10.234')
      .expect(400, 'The parameter value is not a integer : id', done);
  });

  it('receive type error code. (optional param)', function(done) {
    app.get('/path', function(req, res, next) {
      var optional = ['number:id']
        , options = req.fetchParameter([], optional);

      if (req.checkParamErr(options)) return next(options);

      return res.status(200).send(options);
    });

    app.use(function(err, req, res, next) {
      return res.status(err.code).send(err.message);
    });

    request(app)
      .get('/path')
      .query({id: 'ten'})
      .expect(400, 'The parameter value is not a number : id', done);
  });
});
