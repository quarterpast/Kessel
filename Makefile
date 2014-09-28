export SHELL := /bin/bash
export PATH  := $(shell npm bin):$(PATH)

SJS_OPTS = -m sparkler/macros -m adt-simple/macros -m lambda-chop/macros

all: run

lib/%.js: src/%.sjs
	sjs $(SJS_OPTS) $< > $@

test.js: test.sjs macros/index.js
	sjs $(SJS_OPTS) -m ./macros $< > $@

run: lib/index.js t.js
	node t.js

test: lib/index.js test.js
	mocha test.js

.PHONY: run
