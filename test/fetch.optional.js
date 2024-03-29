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
        , optional = ['int:count', 'order', 'float:val', 'int32:sum', 'uint32:max']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .query('count=10')
      .query('order=desc')
      .query('val=30.3')
      .query('sum=2147483647')
      .query('max=4294967295')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({count: 10, order: 'desc', val: 30.3, sum: 2147483647, max: 4294967295});
        expect(_.isSafeInteger(res.body.count)).to.be.true;
        expect(res.body.val).to.not.be.a('string');
        expect(_.isSafeInteger(res.body.val)).to.not.be.true;

        done();
      });
  });

  it('fetch optional parameters with string type and unicode null character', function(done) {
    var postData = {content: 'string with \u0000 unicode null character.'};

    app.use(bodyparser.json());
    app.post('/path', function(req, res, next) {
      var required = []
        , optional = ['string:content']
        , options = req.fetchParameter(required, optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .post('/path')
      .send(postData)
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({content: postData.content.replace(/\u0000/g, '')});
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

  describe('fetch optional parameters with type: string, input: not string', function () {
    beforeEach(function(done){
      app.post('/path', function(req, res, next) {
        var optional = ['string:content']
          , options = req.fetchParameter([], optional);

        if (req.checkParamErr(options)) return next(options);

        return res.send(options);
      });

      app.use(function(err, req, res, next) {
        return res.status(err.code).send(err.message);
      });
      done();
    })

    function testStringTypeParam ({body, done}) {
      request(app)
        .post('/path')
        .send(body)
        .expect(200, function(err, res) {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal({});
          done();
        });
    }

    var notStringValues = [1, true, undefined, null, NaN, {}]
    notStringValues.forEach((args, i) => {
      var body = { content: args }
      it(`#${i}: value = ${args}`, function (done) {
        testStringTypeParam ({body, done})
      });
    });
  });

  describe('fetch optional parameters with type: string and default value and input: not string', function () {
    beforeEach(function(done){
      app.post('/path', function(req, res, next) {
        var optional = ['string:stream|=N']
          , options = req.fetchParameter([], optional);

        if (req.checkParamErr(options)) return next(options);

        return res.send(options);
      });

      app.use(function(err, req, res, next) {
        return res.status(err.code).send(err.message);
      });
      done();
    })

    function testStringTypeParam ({body, done}) {
      request(app)
        .post('/path')
        .send(body)
        .expect(200, function(err, res) {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal({ stream: 'N' });
          done();
        });
    }

    var notStringValues = [1, true, undefined, null, NaN, {}]
    notStringValues.forEach((args, i) => {
      var body = { content: args }
      it(`#${i}: value = ${args}`, function (done) {
        testStringTypeParam ({body, done})
      });
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

  it('fetch optional parameters type with no input', function(done) {
    app.get('/path', function(req, res, next) {
      var optional = ['number:id', 'string:type', 'float:val']
        , options = req.fetchParameter([], optional);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path')
      .expect(200, function(err, res) {
        expect(err).to.not.exist;
        expect(res.body).to.deep.equal({});
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

  it('fetch optional parameters with multiple values', function(done) {
    var postData = {id: [1, 2], type: 'int'};

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({
      extended: true
    }));

    app.use(function(req, res, next) {
      var optional  = ['id', 'type']
        , options = req.fetchParameter([], optional);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .post('/multiple')
      .query('id=abc')
      .query('type=string')
      .send(postData)
      .expect(200, postData, done);
  });
});
