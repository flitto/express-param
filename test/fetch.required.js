var express = require('express')
  , qs = require('querystring')
  , bodyparser = require('body-parser')
  , request = require('supertest')
  , fetcher = require('../');

describe('It can ', function() {
  var app;

  beforeEach(function(done) {
    app = express();
    app.use(fetcher());
    done();
  });

  it('fetch required Parameters', function(done) {
    var options
      , queryString = 'id=1&type=int';

    app.use(function(req, res, next) {
      var required = ['id', 'type'];

      options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/required?' + queryString)
      .expect(200, qs.parse(queryString), done);
  });

  it('fetch required Parameters', function(done) {
    var options
      , postData = {id: 1, type: 'int'};

    //method가 POST일때 안되네..
    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({
      extended: true
    }));
    app.use(function(req, res, next) {
      var required = ['id', 'type'];

      options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .post('/required?ab=e')
      .send(postData)
      .expect(200, postData, done);
  });


  it('fetch required Parameters with path variable', function(done) {
    var options;

    app.get('/path/:id', function(req, res, next) {
      var required = ['{id}', 'type'];

      options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path/10?type=int')
      .expect(200, '{"id":"10","type":"int"}', done);
  });

  it('fetch required Parameters with path underline variable', function(done) {
    var options;

    app.get('/path/:cut_tr_id/:lang_id', function(req, res, next) {
      var required = ['{cut_tr_id}', '{lang_id}',  'type'];

      options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });

    request(app)
      .get('/path/11/20?type=int')
      .expect(200, '{"cut_tr_id":"11","lang_id":"20","type":"int"}', done);
  });

  it('fetch required parameters with type', function(done) {
    var options
      , queryString = 'id=10&type=number';

    app.get('/path', function(req, res, next) {
      var required = ['number:id', 'string:type'];

      options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });
    request(app)
      .get('/path?' + queryString)
      .expect(200, qs.parse(queryString), done);
  });

  it('fetch float parameter with type number', function(done) {
    var options
      , queryString = 'id=10.1&type=number';

    app.get('/path', function(req, res, next) {
      var required = ['number:id', 'string:type'];

      options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });
    request(app)
      .get('/path?' + queryString)
      .expect(200, qs.parse(queryString), done);
  });

  it('fetch float parameter with type number', function(done) {
    var options
      , queryString = 'id=9.999999999999999999999999&type=number';

    app.get('/path', function(req, res, next) {
      var required = ['number:id', 'string:type'];

      options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });
    request(app)
      .get('/path?' + queryString)
      .expect(200, qs.parse(queryString), done);
  });

  it('fetch required parameters with type and path', function(done) {
    var options;

    app.get('/path/:id', function(req, res, next) {
      var required = ['number:{id}', 'string:type'];

      options = req.fetchParameter(required);
      if (req.checkParamErr(options)) return next(options);

      return res.send(options);
    });
    request(app)
      .get('/path/10?type=number')
      .expect(200, '{"id":10,"type":"number"}', done);
  });

});
