class Result
	@is = -> if it instanceof this then it else false
class exports.Success extends Result => (@token, @rest)~>
class exports.Failure extends Result => (@message)~>

exports.keyword = (k, str)-->
	trunc = str.slice 0 k.length
	
	if trunc is k
		Success k, str.slice k.length
	else
		Failure "Expected '#k' got '#trunc'"

exports.seq = (l, r, str)--> match l! str
	| Success~is =>
		{token:lval, rest} = that
		match r! rest
		| Success~is => Success [lval] ++ that.token, that.rest
		| Failure~is => that
	| Failure~is => that

exports.dis = (l, r, str)--> match l str
	| Success~is => that
	| Failure~is => r str

exports.empty = (str)->
	Success [], str