var expresss = require('express')
	, request = require('supertest')
	,	fetch = require('../');

describe('It can ', function() {
	it('fetch optional parameters', function(done) {
		var opt;
		var app = expresss();

		app.use(function(req, res, next) {
			var required = ['id']
				, optional = ['count'];

			opt = fetch.fetch(req, required, optional, next);

			console.log('opttttttt', opt);
			return res.send(opt);
		});

		request(app)
			.get('/optional?id=1&count=20')
			.expect(200, done);
	});

});
