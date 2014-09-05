var expresss = require('express')
	, qs = require('querystring')
	, request = require('supertest')
	,	fetcher = require('../');

describe('It can ', function() {
	var app;

	beforeEach(function(done) {
		app = expresss();
		done();
	});

	it('fetch optional parameters', function(done) {
		var opt
			, queryString = 'id=1&count=20';

		app.get('/path', function(req, res, next) {
			var required = ['id']
				, optional = ['count'];

			opt = fetcher.fetch(req, required, optional, next);
			if (opt.err) return next(opt.err);

			return res.send(opt.params);
		});

		request(app)
			.get('/path?' + queryString)
			.expect(200, qs.parse(queryString), done);
	});

	it('fetch optional parameters with type', function(done) {
		var opt
			, queryString = 'count=10&order=desc';

		app.get('/path', function(req, res, next) {
			var required = []
				, optional = ['number:count', 'order'];

			opt = fetcher.fetch(req, required, optional, next);
			if (opt.err) return next(opt.err);

			return res.send(opt.params);
		});

		request(app)
			.get('/path?' + queryString)
			.expect(200, qs.parse(queryString),done);
	});

	it('fetch optional parameters with defaultValue', function(done) {
		var opt
			, queryString = 'count=10&order=desc';

		app.get('/path', function(req, res, next) {
			var required = []
				, optional = ['number:count', 'order', 'val|=10'];

			opt = fetcher.fetch(req, required, optional, next);
			if (opt.err) return next(opt.err);

			return res.send(opt.params);
		});

		request(app)
			.get('/path?' + queryString)
			.expect(200, qs.parse(queryString + '&val=10'),done);
	});

	it('fetch optional parameters with defaultValue and type', function(done) {
		var opt
			, queryString = 'count=10&order=desc';

		app.get('/path', function(req, res, next) {
			var required = []
				, optional = ['number:count', 'order', 'number:val|=10'];

			opt = fetcher.fetch(req, required, optional, next);
			if (opt.err) return next(opt.err);

			return res.send(opt.params);
		});

		request(app)
			.get('/path?' + queryString)
			.expect(200, qs.parse(queryString + '&val=10'), done)
	});
});
