var kessel = require('./lib');
var expect = require('expect.js');

/*
macro λ {
	rule { $p:ident -> $r:expr } => {function($p) { return $r }}
}

var atom  = %/[a-z0-9\-_$]/i;
var seq   = cexpr ~ seq | kessel.empty;
var sexpr = atom | (%"(" ~ seq ~ %")" ^^ λ a -> a[1]);
var cexpr = (%"{" ~ sexpr ~ atom ~ sexpr ~ %"}" ^^ λ a -> [a[2], a[1], a[3]]) | sexpr;

var result = cexpr("(a {a - c} (a))");
console.log(result.token ? JSON.stringify(result.token, null, 2) : result.message);*/

macro to_str {
  case { _ ($toks ...) } => {
    return [makeValue(#{ $toks ... }.map(unwrapSyntax).join(''), #{ here })];
  }
}
let describe = macro {
	rule { $s $body } => { describe($s, function() $body); }
}
let it = macro {
	rule { $s $body } => { it($s, function() $body); }
}


describe "keyword" {
	describe "matching" {
		it "should match exact matches" {
			expect(kessel.keyword("a","a")).to.be.a(kessel.Success);
		}
		it "should save match as token" {
			expect(kessel.keyword("a","a")).to.have.property("token", "a");
		}
		it "should match prefix match" {
			expect(kessel.keyword("a","abc")).to.be.a(kessel.Success);
		}
		it "should save prefix match as token" {
			expect(kessel.keyword("a","abc")).to.have.property("token", "a");
		}
		it "should save prefix remainder as rest" {
			expect(kessel.keyword("a","abc")).to.have.property("rest", "bc");
		}
	}

	describe "not matching" {
		it "doesn't match something completely different" {
			expect(kessel.keyword("a", "b")).to.be.a(kessel.Failure);
		}
		it "gives an expected message" {
			expect(kessel.keyword("a", "b")).to.have.property("message", "Expected 'a' got 'b'");
		}
		it "doesn't match an incomplete match" {
			expect(kessel.keyword("asdf", "a")).to.be.a(kessel.Failure);
		}
		it "gives an expected message for incomplete match" {
			expect(kessel.keyword("asdf", "a")).to.have.property("message", "Expected 'asdf' got 'a'");
		}

	}
}
