var curry = require('curry');

union Result {
	Success { token: *, rest: * },
	Failure { message: String }
} deriving require('adt-simple').Base;

data Input {
	index: Number,
	content: String
} deriving require('adt-simple').Base;

function toInput {
	i @ Input  => i,
	s @ String => Input(0, s)
}

exports.Success = Success;
exports.Failure = Failure;

var Token = {
	tokens: {
		StringToken: {
			support: function {
				String => true,
				* => false
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
		RegexToken: {
			support: function {
				RegExp => true,
				* => false
			},
			match: function(str) {
				var m = this.tok.exec(str);
				if(m) {
					return m[1] || m[0];
				}
			},
			expected: function(got) {
				return "Expected '"+this.tok+"' got '"+got+"'";
			},
			rest: function(str, m) {
				return str.slice(m.length);
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

var memotable = {};
var counts = {};

exports.memo = curry(function(label, parser, input) {
	input = toInput(input);
	if(memotable[label] && memotable[label][input.index]) {
		return memotable[label][input.index];
	}

	if(!counts[label]) counts[label] = {};
	if(counts[label][input.index] > input.content.length + 1) {
		return Failure('Too much recursion');
	}

	if(!memotable[label]) memotable[label] = {};
	counts[label][input.index] = (counts[label][input.index] || 0) + 1;
	return memotable[label][input.index] = parser()(input.content);
});

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

exports.map = curry(function(f, p, str) {
	return match p(str) {
		Success{token, rest} => Success(f(token), rest),
		r @ Failure => r
	};
});

exports.empty = function(str) {
	return Success([], str);
}
