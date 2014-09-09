var expresss = require('express')
	, qs = require('querystring')
	, request = require('supertest')
	,	fetcher = require('../');

describe('It can ', function() {
	var app;

	beforeEach(function (done) {
		app = expresss();
		app.use(fetcher());
		done();
	});

	it('receive error code.', function(done) {
		var options;
		app.get('/path/:id', function(req, res, next) {
			var required = ['{id}', 'type', 'order'];


			options = req.fetchParameter(required, []);
			if (options.err) return next(options.err);

			return res.status(200).send(options.params);
		});
		app.use(function(err, req, res, next) {
			return res.status(400).send(err);
		});

		request(app)
			.get('/path/10')
			.expect(400, done);
	});
});
