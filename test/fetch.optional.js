'use strict';

var express = require('express')
  , request = require('supertest')
  , _ = require('lodash')
  , expect = require('chai').expect
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
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({id: '1', count: '20'});
        done();
      });
  });

  it('fetch optional parameters with int and float type', function(done) {
    app.get('/path', function(req, res, next) {
      var required = []
        , optional = ['int:count', 'order', 'float:val']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('count=10')
      .query('order=desc')
      .query('val=30.3')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({count: 10, order: 'desc', val: 30.3});
        expect(_.isSafeInteger(res.body.count)).to.be.true;
        expect(res.body.val).to.not.be.a('string');
        expect(_.isSafeInteger(res.body.val)).to.not.be.true;

        done();
      });
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
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({count: 10, order: 'asc', val: '10'});
        done();
      });
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
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({count: 10, order: 'desc', val: 10});
        done();
      });
  });

  it('fetch optional parameters input blank string', function(done) {
    app.get('/path', function(req, res, next) {
      var required = []
        , optional = ['id|=10']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('id=')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({id: ''});
        done();
      });
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
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({id: 0, type: 'number'});
        done();
      });
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
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({id: 0, type: ''});
        done();
      });
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
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({name: 'second', id: 2, type: 'number'});
        done();
      });
  });
});
