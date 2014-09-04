REPORTER = dot
test:
	@NODE_ENV=test node_modules/mocha/bin/mocha --reporter $(REPORTER) 

test-cov:
	@NODE_ENV=test istanbul cover --hook-run-in-context node_modules/mocha/bin/_mocha -- -R spec

all: test test-cov

.PHONY: test test-cov all
