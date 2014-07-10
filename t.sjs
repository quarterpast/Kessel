var kessel = require('./lib');

macro λ {
	rule { $p:ident -> $r:expr } => {function($p) { return $r }}
}

var atom  = %/[a-z0-9\-_$]/i;
var seq   = cexpr ~ seq | kessel.empty;
var sexpr = atom | (%"(" ~ seq ~ %")" ^^ λ a -> a[1]);
var cexpr = (%"{" ~ sexpr ~ atom ~ sexpr ~ %"}" ^^ λ a -> [a[2], a[1], a[3]]) | sexpr;

var result = cexpr("(a {a - c} (a))");
console.log(result.token ? JSON.stringify(result.token, null, 2) : result.message);
