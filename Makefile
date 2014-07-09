export SHELL := zsh

all: run

lib/%.js: src/%.ls
	mkdir -p lib
	lsc -o lib -c $<

t.js: macros/index.js
	sjs $< > $@

run: lib/index.js t.js
	node t.js

.PHONY: run
