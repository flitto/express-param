'use strict';

var express = require('express')
  , bodyparser = require('body-parser')
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

  it('fetch required Parameters', function(done) {
    app.use(function(req, res, next) {
      var required = ['id', 'type']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/required')
      .query('id=1')
      .query('type=int')
      .expect(200, {id: '1', type: 'int'}, done);
  });

  it('fetch required Parameters', function(done) {
    var postData = {id: 1, type: 'int'};

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({
      extended: true
    }));

    app.use(function(req, res, next) {
      var required = ['id', 'type']
        , options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .post('/required')
      .query('id=abc')
      .query('type=string')
      .send(postData)
      .expect(200, postData, done);
  });


  it('fetch required Parameters with path variable', function(done) {
    app.get('/path/:id', function(req, res, next) {
      var required = ['{id}', 'type']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path/10')
      .query('type=int')
      .expect(200, {id: '10', type: 'int'}, done);
  });

  it('fetch required parameters with type and path', function(done) {
    app.get('/path/:id', function(req, res, next) {
      var required = ['number:{id}', 'string:type']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });
    request(app)
      .get('/path/10')
      .query('type=number')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({id: 10, type: 'number'});
        done();
      });
  });

  it('fetch required Parameters with path underline variable', function(done) {
    app.get('/path/:cut_tr_id/:lang_id', function(req, res, next) {
      var required = ['number:{cut_tr_id}', 'int:{lang_id}', 'type']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path/11/20')
      .query('type=int')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({cut_tr_id: 11, lang_id: 20, type: 'int'});
        expect(_.isSafeInteger(res.body.lang_id)).to.be.true;
        done();
      });
  });

  it('fetch required parameters with type', function(done) {
    app.get('/path', function(req, res, next) {
      var required = ['number:id', 'string:type']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('id=10')
      .query('type=number')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({id: 10, type: 'number'});
        done();
      });
  });

  it('fetch float parameter with type number', function(done) {
    app.get('/path', function(req, res, next) {
      var required = ['number:id', 'string:type', 'number:val']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('id=10.1')
      .query('type=number')
      .query('val=9.999999999999999')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({id: 10.1, type: 'number', val: 9.999999999999999});
        done();
      });
  });

  it('fetch float parameter with type float', function(done) {
    app.get('/path', function(req, res, next) {
      var required = ['number:id', 'string:type', 'float:val']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('id=9.999999999999999999999999')
      .query('type=number')
      .query('val=9.999999999999999')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({id: 10, type: 'number', val: 9.999999999999999});
        done();
      });
  });

  it('fetch required parameter with type int(Safe Integer)', function(done) {
    app.get('/path', function(req, res, next) {
      var required = ['int:id', 'string:type']
        , options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('id=99')
      .query('type=int')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({id: 99, type: 'int'});
        expect(_.isSafeInteger(res.body.id)).to.be.true;
        done();
      });
  });
});
