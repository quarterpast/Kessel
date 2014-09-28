union Result {
	Success { token: *, rest: * },
	Failure { message: String }
} deriving require('adt-simple').Base

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
				return "Expected '"+this.tok+"', got '"+got.slice(0, this.tok.length)+"'";
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

exports.keyword = function(key, str) {
	var tok = Token.create(key);
	var m = tok.match(str);
	if(m) {
		return Success(m, tok.rest(str, m));
	}

	return Failure(tok.expected(str));
};
