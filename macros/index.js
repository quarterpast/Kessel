macro (=>) {
	rule { $r:expr } => { function() { return $r } }
}

macro (%) {
	rule { $k:lit } => { require('./lib').keyword($k) }
	rule { $k }     => { require('./lib').regex($k)   }
}
export (%);

operator (|)   14 left  { $l, $r } => #{ require('./lib').dis($l, $r) }
operator (~)   16 right { $l, $r } => #{ require('./lib').seq(=> $l, => $r) }
operator (^^)  12 left  { $l, $r } => #{ require('./lib').map($r, $l) }
operator (^^^) 12 left  { $l, $r } => #{ require('./lib').map(=> $r, $l) }

export (|);
export (~);
export (^^);
export (^^^);
