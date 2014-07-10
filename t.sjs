var kessel = require('./lib');

var atom  = %/[a-z]+/;
var sexpr = atom | (%"(" ~ seq ~ %")" ^^ function(a) { return a[1] });
var seq   = sexpr ~ seq | kessel.empty;

var result = sexpr("(a (a a) (a))");
console.log(result.token ? JSON.stringify(result.token, null, 2) : result.message);
