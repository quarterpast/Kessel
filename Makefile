export SHELL := zsh

all: run

lib/%.js: src/%.ls
	mkdir -p lib
	lsc -o lib -c $<

%.js: %.sjs macros/index.js
	sjs -m ./macros $< > $@

run: lib/index.js t.js
	node t.js

.PHONY: run
