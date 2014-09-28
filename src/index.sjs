var curry = require('curry');

union Result {
	Success { token: *, rest: * },
	Failure { message: String }
} deriving require('adt-simple').Base

exports.Success = Success;
exports.Failure = Failure;

var Token = {
	tokens: {
		StringToken: {
			support: function(s) {
				return typeof s === 'string';
			},
			match: function(str) {
				if(this.tok === str.slice(0, this.tok.length)) {
					return this.tok;
				}
			},
			expected: function(got) {
				return "Expected '"+this.tok+"' got '"+got.slice(0, this.tok.length)+"'";
			},
			rest: function(str, m) {
				return str.slice(this.tok.length);
			}
		},
	},

	create: function(tok) {
		for(var t in this.tokens) {
			if(this.tokens[t].support(tok)) {
				return Object.create(this.tokens[t], {
					tok: {value: tok}
				});
			}
		}

		return tok;
	}
};

exports.keyword = curry(function(key, str) {
	var tok = Token.create(key);
	var m = tok.match(str);
	if(m) {
		return Success(m, tok.rest(str, m));
	}

	return Failure(tok.expected(str));
});

exports.seq = curry(function(l, r, str) {
	match l()(str) {
		case Success{token, rest}: 
			var ltok = token;
			return match r()(rest) {
				Success{token, rest} => Success([ltok].concat(token), rest),
				f @ Failure => f
			}
		case f @ Failure:
			return f;
	}
});

exports.dis = curry(function(l, r, str) {
	return match l(str) {
		s @ Success => s,
		Failure => r(str);
	};
});
