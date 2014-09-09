var express = require('express')
	, qs = require('querystring')
	, bodyparser = require('body-parser')
	, request = require('supertest')
	,	fetcher = require('../');

describe('It can ', function() {
	var app;

	beforeEach(function(done) {
		app = express();
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

	it('fetch required Parameters', function(done) {
		var options
			, postData = {id: 1, type: 'int'}
			, queryString = 'id=1&type=int';

		//method가 POST일때 안되네..
		app.use(bodyparser());
		app.use(function(req, res, next) {
			var required = ['id', 'type'];

			options = fetcher.fetch(req, required);

			if (options.err) return next(options.err);

			return res.send(options.params);
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