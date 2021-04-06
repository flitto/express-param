const express = require('express');
const isEqual = require('lodash/isEqual');
const request = require('supertest');
const imsiList = require('mcc-mnc-list').all()
const fetcher = require('../');

describe('It can ', function() {
  let app;
  const mcc = '450';
  const mnc = '11';
  let expectedList;

  beforeEach(function (done) {
    app = express();
    //additional custom option
    // key : your key name within http request
    // val : default property of req(express value)
    app.use(fetcher({
      user: 'user',
      ipaddr: 'ip'
    }, {imsi: true}));

    expectedList = imsiList.filter((el) => el.mcc === mcc);
    done();
  });

  it('fetch imsi info by mcc', function(done) {
    app.use(function(req, res, next) {
      const required = ['ipaddr'];
      const options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      const imsi = req.headers['x-fetcher-imsi'];

      if (!isEqual(imsi, expectedList)) {
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
      const required = ['ipaddr']
      const options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      expectedList = imsiList.filter((el) => (el.mcc === mcc && el.mnc === mnc));
      const imsi = req.headers['x-fetcher-imsi'];

      if (!isEqual(imsi, expectedList)) {
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

  it('no error without mcc', function(done) {
    app.use(function(req, res, next) {
      const required = ['ipaddr'];
      const options = req.fetchParameter(required);

      if (req.checkParamErr(options)) return next(options);

      const imsi = req.headers['x-fetcher-imsi'];
      if (!isEqual(imsi, [])) {
        throw new Error('Should be [] without mcc parameter!');
      }
      return res.send(options);
    });

    request(app)
      .get('/required')
      .query('mcc=')
      .expect(200, done);
  });

  it('fetch access country from remote ip address after apply "imsi" additional options', function(done) {
    const extraOption = {'access-country': true};
    app.use(fetcher(extraOption));

    app.use((req, res, next) => {
      const options = req.fetchParameter([], ['ipaddr', 'access-country']);
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
