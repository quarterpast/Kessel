export SHELL := /bin/bash
export PATH  := $(shell npm bin):$(PATH)

all: run

lib/%.js: src/%.ls
	mkdir -p lib
	lsc -o lib -c $<

%.js: %.sjs macros/index.js
	sjs -m ./macros $< > $@

run: lib/index.js t.js
	node t.js

test: lib/index.js test.js
	mocha test.js

.PHONY: run
