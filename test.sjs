var kessel = require('./lib');
var sinon  = require('sinon');
var expect = require('sinon-expect').enhance(require('expect.js'), sinon, 'was');

var Success = kessel.Success;
var Failure = kessel.Failure;

macro => {
	rule { $r:expr } => { (function() {return $r}) }
}

macro (=!>) {
	rule infix { ($l:expr (,) ...) | $r:expr } => { sinon.stub().withArgs($($l (,) ...)).returns($r) }
	rule { $r:expr } => { sinon.stub().returns($r) }
}

macro to_str {
	case { _ ($toks ...) } => {
		return [makeValue(#{ $toks ... }.map(unwrapSyntax).join(''), #{ here })];
	}
}
let describe = macro {
	rule { $s $body } => { describe($s, function() $body); }
}
let it = macro {
	rule { $s $body } => { it($s, function() $body); }
}

describe "keyword" {
	describe "string" {
		describe "matching" {
			it "should match exact matches" {
				expect(kessel.keyword("a","a")).to.be.a(Success);
			}
			it "should save match as token" {
				expect(kessel.keyword("a","a")).to.have.property("token", "a");
			}
			it "should match prefix match" {
				expect(kessel.keyword("a","abc")).to.be.a(Success);
			}
			it "should save prefix match as token" {
				expect(kessel.keyword("a","abc")).to.have.property("token", "a");
			}
			it "should save prefix remainder as rest" {
				expect(kessel.keyword("a","abc").rest).to.have.property("content", "bc");
			}
		}

		describe "not matching" {
			it "doesn't match something completely different" {
				expect(kessel.keyword("a", "b")).to.be.a(Failure);
			}

			it "gives an expected message" {
				expect(kessel.keyword("a", "b")).to.have.property("message", "Expected 'a' got 'b'");
			}

			it "doesn't match an incomplete match" {
				expect(kessel.keyword("asdf", "a")).to.be.a(Failure);
			}

			it "gives an expected message for incomplete match" {
				expect(kessel.keyword("asdf", "a")).to.have.property("message", "Expected 'asdf' got 'a'");
			}
		}
	}

	describe "regex" {
		describe "matching" {
			it "should match exact matches" {
				expect(kessel.keyword(/a/,"a")).to.be.a(Success);
			}
			it "should save match as token" {
				expect(kessel.keyword(/a/,"a")).to.have.property("token", "a");
			}
			it "should match prefix match" {
				expect(kessel.keyword(/a/,"abc")).to.be.a(Success);
			}
			it "should save prefix match as token" {
				expect(kessel.keyword(/a/,"abc")).to.have.property("token", "a");
			}
			it "should save prefix remainder as rest" {
				expect(kessel.keyword(/a/,"abc").rest).to.have.property("content", "bc");
			}
		}

		describe "not matching" {
			it "doesn't match something completely different" {
				expect(kessel.keyword(/a/, "b")).to.be.a(Failure);
			}

			it "gives an expected message" {
				expect(kessel.keyword(/a/, "b")).to.have.property("message", "Expected '/a/' got 'b'");
			}

			it "doesn't match an incomplete match" {
				expect(kessel.keyword(/asdf/, "a")).to.be.a(Failure);
			}

			it "gives an expected message for incomplete match" {
				expect(kessel.keyword(/asdf/, "a")).to.have.property("message", "Expected '/asdf/' got 'a'");
			}
		}
	}

}

describe "seq" {
	describe "success followed by success" {
		it "should be success" {
			expect(kessel.seq(=> => Success("",""), => => Success("",""))("")).to.be.a(Success);
		}

		it "should give an array of tokens" {
			expect(kessel.seq(=> => Success("a",""), => => Success("b",""))("").token).to.eql(["a","b"]);
		}

		it "should match left on arg of seq" {
			var l = ("a")=!> Success("a", "");
			expect(kessel.seq(=> l, => => Success("",""))("a")).to.be.a(Success);
			expect(l.lastCall.args[0]).to.have.property("content","a");
		}

		it "should match right on rest of left" {
			var r = ("b")=!> Success("b", "");
			expect(kessel.seq(=> => Success("", "b"), => r)("")).to.be.a(Success);
			expect(r).was.calledWith("b");
		}

		it "should give rest as rest of right" {
			var r = ("b")=!> Success("b", "");
			expect(kessel.seq(=> => Success("", ""), => => Success("", "c"))("")).to.have.property("rest", "c");
		}
	}

	describe "failure followed by success" {
		it "should be failure" {
			expect(kessel.seq(=> => Failure(""), => => Success())("")).to.be.a(Failure);
		}
		it "should pass message along" {
			expect(kessel.seq(=> => Failure("nope"), => => Success())("")).to.have.property("message","nope");
		}
		it "shouldn't even bother calling the second thing" {
			var r = =!> => Success();
			kessel.seq(=> => Failure(""), r)("");
			expect(r).was.notCalled();
		}
	}

	describe "failure followed by failure" {
		it "should be failure" {
			expect(kessel.seq(=> => Failure(""), => => Failure())("")).to.be.a(Failure);
		}
		it "should pass first message along" {
			expect(kessel.seq(=> => Failure("nope"), => => Failure("haha"))("")).to.have.property("message","nope");
		}
		it "shouldn't even bother calling the second thing" {
			var r = =!> => Failure("");
			kessel.seq(=> => Failure(""), r)("");
			expect(r).was.notCalled();
		}
	}

	describe "success followed by failure" {
		it "should be failure" {
			expect(kessel.seq(=> => Success("",""), => => Failure(""))("")).to.be.a(Failure);
		}
		it "should pass message along" {
			expect(kessel.seq(=> => Success("",""), => => Failure("nope"))("")).to.have.property("message","nope");
		}
	}
}

describe "dis" {
	describe "success or failure" {
		it "should be success" {
			expect(kessel.dis(=> Success(), => Failure(""))("")).to.be.a(Success);
		}

		it "should pass along token" {
			expect(kessel.dis(=> Success("a"), => Failure(""))("")).to.have.property("token","a");
		}

		it "should pass along rest" {
			expect(kessel.dis(=> Success(null, "a"), => Failure(""))("")).to.have.property("rest","a");
		}
	}
	describe "failure or success" {
		it "should be success" {
			expect(kessel.dis(=> Failure(""), => Success())("")).to.be.a(Success);
		}

		it "should pass along token" {
			expect(kessel.dis(=> Failure(""), => Success("a"))("")).to.have.property("token","a");
		}

		it "should pass along rest" {
			expect(kessel.dis(=> Failure(""), => Success(null, "a"))("")).to.have.property("rest","a");
		}
	}
	
	describe "failure or failure" {
		it "should be failure" {
			expect(kessel.dis(=> Failure(""), => Failure(""))("")).to.be.a(Failure);
		}

		it "should pass along second message" {
			expect(kessel.dis(=> Failure("a"), => Failure("b"))("")).to.have.property("message","b");
		}
	}

	describe "success or success" {
		it "should be success" {
			expect(kessel.dis(=> Success(), => Success())("")).to.be.a(Success);
		}

		it "should pass along first token" {
			expect(kessel.dis(=> Success("a"), => Success("b"))("")).to.have.property("token","a");
		}

		it "should pass along first rest" {
			expect(kessel.dis(=> Success(null, "a"), => Success(null, "b"))("")).to.have.property("rest","a");
		}

		it "shouldn't even bother calling the second thing" {
			var r = =!> Success();
			kessel.dis(=> Success(), r)("");
			expect(r).was.notCalled();
		}
	}
}

describe "map" {
	describe "success" {
		it "should be successful" {
			expect(kessel.map(λ -> null, => Success())("")).to.be.a(Success);
		}
		it "should apply function to token" {
			expect(kessel.map(λ[# + "world"], => Success("hello "))("")).to.have.property("token", "hello world");
		}
		it "should leave rest alone" {
			expect(kessel.map(λ -> null, => Success("","rest"))("")).to.have.property("rest", "rest");
		}
	}
	describe "failure" {
		it "should fail" {
			expect(kessel.map(λ -> null, => Failure(""))("")).to.be.a(Failure);
		}
	}
}

//TODO: how to fail when there's string left to consume?
//TODO: if dis is failing the entire branch how can we ever reach the keyword?
describe "the whole thing" {
	it "should support left-recursive grammars" {
		// a ::= a "a" | ε
		var b = kessel.memo('b', kessel.seq(=> a, => kessel.keyword("a")));
		var a = kessel.memo('a', kessel.dis(b, kessel.empty));
		expect(a("a")).to.be.a(Success);
		expect(a("a").token).to.eql("a");
		expect(a("aaa").token).to.eql(["a","a","a"]);
	}

	it "should match a left-recursive expr grammar" {
		// expr ::= expr "+" expr | [0-9]
		var plus = kessel.keyword('+');
		var term = kessel.keyword(/^\d+/);
		var addX = kessel.memo('addX', kessel.seq(=> kessel.seq(=> expr, => plus), => expr));
		var expr = kessel.memo('expr', kessel.dis(addX, term));
		expect(expr('1+2')).to.be.a(Success);
		expect(expr('1+2').token).to.eql([['1'],['2']])
	}
}


