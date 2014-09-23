macro $kessel {
  rule {} => { require('kessel') }
}

macro (=>) {
	rule { $r:expr } => { function() { return $r } }
}

macro (%) {
	rule { $k:lit } => { $kessel.keyword($k) }
	rule { $k }     => { $kessel.regex($k)   }
}
export (%);

operator (|)   14 left  { $l, $r } => #{ $kessel.dis($l, $r) }
operator (~)   16 right { $l, $r } => #{ $kessel.seq(=> $l, => $r) }
operator (^^)  12 left  { $l, $r } => #{ $kessel.map($r, $l) }
operator (^^^) 12 left  { $l, $r } => #{ $kessel.map(=> $r, $l) }

export (|);
export (~);
export (^^);
export (^^^);
