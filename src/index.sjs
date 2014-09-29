var curry = require('curry');

union Result {
	Success { token: *, rest: * },
	Failure { message: String }
} deriving require('adt-simple').Base;

data Input {
	index: Number,
	content: String,
	memotable: Object,
	counts: Object
} deriving require('adt-simple').Base;

function toInput {
	i @ Input  => i,
	s @ String => Input(0, s, {}, {}),
	x => {throw new Error('no match: '+x);}
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
			match: function(input) {
				if(this.tok === input.content.slice(0, this.tok.length)) {
					return this.tok;
				}
			},
			expected: function(got) {
				return "Expected '"+this.tok+"' got '"+got.slice(0, this.tok.length)+"'";
			},
			rest: function(input, m) {
				return Input(
					input.index + m.length,
					input.content.slice(m.length),
					input.memotable,
					input.counts
				);
			}
		},
		RegexToken: {
			support: function {
				RegExp => true,
				* => false
			},
			match: function(input) {
				var m = this.tok.exec(input.content);
				if(m) {
					return m[1] || m[0];
				}
			},
			expected: function(got) {
				return "Expected '"+this.tok+"' got '"+got+"'";
			},
			rest: function(input, m) {
				return Input(
					input.index + m.length,
					input.content.slice(m.length),
					input.memotable,
					input.counts
				);
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

exports.memo = curry(function(label, parser, input) {
	input = toInput(input);

	if(input.memotable[label] && input.memotable[label][input.index]) {
		return input.memotable[label][input.index];
	}

	if(!input.counts[label]) input.counts[label] = {};
	if(input.counts[label][input.index] > input.content.length + 1) {
		return Failure('Too much recursion');
	}

	if(!input.memotable[label]) input.memotable[label] = {};
	input.counts[label][input.index] = (input.counts[label][input.index] || 0) + 1;
	return input.memotable[label][input.index] = parser()(input);
});

exports.keyword = curry(function(key, input) {
	var tok = Token.create(key);
	input = toInput(input);
	var m = tok.match(input);
	if(m) {
		return Success(m, tok.rest(input, m));
	}

	return Failure(tok.expected(input.content));
});

exports.seq = curry(function(l, r, input) {
	input = toInput(input);
	match l()(input) {
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

exports.dis = curry(function(l, r, input) {
	input = toInput(input);
	return match l(input) {
		s @ Success => s,
		Failure => r(input);
	};
});

exports.map = curry(function(f, p, input) {
	input = toInput(input);

	return match p(input) {
		Success{token, rest} => Success(f(token), rest),
		r @ Failure => r
	};
});

exports.empty = function(input) {
	input = toInput(input);

	return Success([], input);
};
