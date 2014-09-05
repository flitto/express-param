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

	it('fetch required Parameters', function(done) {
		var options
			, queryString = 'id=1&type=int';

		app.use(function(req, res, next) {
			var required = ['id', 'type'];

			options = fetcher.fetch(req, required);

			if (options.err) return next(options.err);

			return res.send(options.params);
		});

		request(app)
			.get('/required?' + queryString)
			.expect(200, qs.parse(queryString), done);
	});

	it('fetch required Parameters with path variable', function(done) {
		var options;

		app.get('/path/:id', function(req, res, next) {
			var required = ['{id}', 'type'];

			options = fetcher.fetch(req, required);
			if (options.err) return next(options.err);

			return res.send(options.params);
		});

		request(app)
			.get('/path/10?type=int')
			.expect(200, '{"id":"10","type":"int"}', done);
	});

	it('fetch required parameters with type', function(done) {
		var options
			, queryString = 'id=10&type=number';

		app.get('/path', function(req, res, next) {
			var required = ['number:id', 'string:type'];

			options = fetcher.fetch(req, required);
			if (options.err) return next(options.err);

			return res.send(options.params);
		});
		request(app)
			.get('/path?' + queryString)
			.expect(200, qs.parse(queryString), done);
	});

	it('fetch required parameters with type and path', function(done) {
		var options
			, queryString = 'id=10&type=number';

		app.get('/path/:id', function(req, res, next) {
			var required = ['number:{id}', 'string:type'];

			options = fetcher.fetch(req, required);
			if (options.err) return next(options.err);

			return res.send(options.params);
		});
		request(app)
			.get('/path/10?type=number')
			.expect(200, '{"id":10,"type":"number"}', done);
	});
});