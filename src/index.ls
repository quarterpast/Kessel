class Result
	@is = -> if it instanceof this then it else false
class exports.Success extends Result => (@token, @rest)~>
class exports.Failure extends Result => (@message)~>

class Token
	@subclasses = [Token]
	@support = (.constructor is Token)
	@extended = -> @subclasses.push it
	@create = ->
		for s in @subclasses when s.support it
			return s it
	(tok)~> return tok
	rest:  (str, m)-> str.substr m.length

class StringToken extends Token
	@support = -> typeof it is \string
	(@tok)~>
	match: (str)-> @tok if @tok is str.slice 0 @tok.length
	expected: (got)-> "Expected '#{@tok}' got '#{got.slice 0 @tok.length}'"

class RegexToken extends Token
	@support = (instanceof RegExp)
	(@tok)~>
	match: (str)-> that.1 ? that.0 if @tok.exec str
	expected: (got)-> "Expected '#{@tok}' got '#got'"

exports.keyword = (key, str)-->
	k = Token.create key
	
	if (k.match str)?
		Success that, k.rest str, that
	else
		Failure k.expected str

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

exports.map = (f, p, str)--> match p str
	| Success~is => Success (f that.token), that.rest
	| Failure~is => that

