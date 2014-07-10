var kessel = require('./lib');

macro (=>) {
	rule { $r:expr } => { function() { return $r } }
}

macro (%) {
	rule { $k:lit } => { kessel.keyword($k) }
	rule { $k }     => { kessel.regex($k)   }
}

operator (|)   14 left  { $l, $r } => #{ kessel.dis($l, $r) }
operator (~)   16 right { $l, $r } => #{ kessel.seq(=> $l, => $r) }
operator (^^)  12 left  { $l, $r } => #{ kessel.map($r, $l) }
operator (^^^) 12 left  { $l, $r } => #{ kessel.map(=> $r, $l) }

var atom  = %/[a-z]+/;
var sexpr = atom | (%"(" ~ seq ~ %")" ^^ function(a) { return a[1] });
var seq   = sexpr ~ seq | kessel.empty;

var result = sexpr("(a (a a) (a))");
console.log(result.token ? JSON.stringify(result.token, null, 2) : result.message);
