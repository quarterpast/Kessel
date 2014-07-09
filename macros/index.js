var kessel = require('./lib');

macro (=>) {
	rule { $r:expr } => { function() { return $r } }
}

macro (%) {
	rule { $k:lit } => { kessel.keyword($k) }
	rule { $k }     => { kessel.regex($k)   }
}

operator (|) 14 left { $l, $r } => #{ kessel.dis($l, $r) }
operator (~) 16 right { $l, $r } => #{ kessel.seq(=> $l, => $r) }

var atom  = %/[a-z]+/;
var sexpr = %"(" ~ seq ~ %")" | atom;
var seq   = sexpr ~ seq | kessel.empty;

var result = sexpr("(a(aa))");
console.log(result.token ? JSON.stringify(result.token, null, 2) : result.message);
