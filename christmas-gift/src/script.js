var s = c.width = c.height = 400,
		ctx = c.getContext( '2d' ),
		
		opts = {
			
			colors: [ 'hsl(100,00%,20%)', 'hsl(40,90%,50%)' ],
			height: 100,
			base: 100,
			change: .25, // color change in 0->1
			coverHeight: .8,
			coverBase: 1.1,
			coverOffset: .6,
			coverAddedOffset: -40,
			rotYSpeed: .015,
			sides: 4,
			depth: 400,
			rotX: .5,
			focalLength: 250,
			vanishPoint: {
				x: s / 2,
				y: s / 2
			},
			
			linearIncrement: .05
		},
		calc = {
			
			rotYcos: Math.cos( opts.rotYSpeed ),
			rotYsin: Math.sin( opts.rotYSpeed ),
			rotXcos: Math.cos( opts.rotX ),
			rotXsin: Math.sin( opts.rotX ),
			
			pC: +opts.change, // positiveChange
			nC: -opts.change, // negativeChange
			
			cY: -1 + opts.coverOffset - opts.coverHeight, // cover start y
			cy: -1 + opts.coverOffset, // cover end y
			cx: +opts.coverBase, // cover start x
			cX: -opts.coverBase, // cover end x,
			cz: opts.coverBase
		},
		
	  faces = [],
		points = [],
		
		hovering = false,
		linearProportion = 0,
		proportion = 0;

for( var i = 0; i < 4; ++i ){
	
	// define a single face, then create it 4 times at different rotations in order to get the proper points
	
	var index = points.length,
			rad = i / opts.sides * Math.PI * 2,
			sin = Math.sin( rad ),
			cos = Math.cos( rad );
	
	// yes, all of the points will be duplicated
	// but it's only like 64 points in total so meh
	points.push( rotate(  1,  1,  1, sin, cos, false ) );
	points.push( rotate(  1, -1,  1, sin, cos, false ) );
	points.push( rotate( -1, -1,  1, sin, cos, false ) );
	points.push( rotate( -1,  1,  1, sin, cos, false ) );
	
	faces.push( new Face( 
		points[ index ],
		points[ index + 1 ],
		points[ index + 2 ],
		points[ index + 3 ], false, false ) );
	
	index = points.length;
	
	points.push( rotate( calc.pC,  1, 1, sin, cos, false ) );
	points.push( rotate( calc.pC, -1, 1, sin, cos, false ) );
	points.push( rotate( calc.nC, -1, 1, sin, cos, false ) );
	points.push( rotate( calc.nC,  1, 1, sin, cos, false ) );
	
	faces.push( new Face( 
		points[ index ],
		points[ index + 1 ],
		points[ index + 2 ],
		points[ index + 3 ], true, false ) );
	
	index = points.length;
	
	points.push( rotate( calc.cx, calc.cy, calc.cz, sin, cos, true ) );
	points.push( rotate( calc.cx, calc.cY, calc.cz, sin, cos, true ) );
	points.push( rotate( calc.cX, calc.cY, calc.cz, sin, cos, true ) );
	points.push( rotate( calc.cX, calc.cy, calc.cz, sin, cos, true ) );
	
	faces.push( new Face( 
		points[ index ],
		points[ index + 1 ],
		points[ index + 2 ],
		points[ index + 3 ], false, true ) );
	
	index = points.length;
	
	points.push( rotate( calc.pC, calc.cy, calc.cz, sin, cos, true ) );
	points.push( rotate( calc.pC, calc.cY, calc.cz, sin, cos, true ) );
	points.push( rotate( calc.nC, calc.cY, calc.cz, sin, cos, true ) );
	points.push( rotate( calc.nC, calc.cy, calc.cz, sin, cos, true ) );
	
	faces.push( new Face( 
		points[ index ],
		points[ index + 1 ],
		points[ index + 2 ],
		points[ index + 3 ], true, true) );
}

// just add the cover top faces
faces.push( new Face(
		points[ 16 * 3 + 10 ],
		points[ 16 * 2 + 10 ],
		points[ 16 * 1 + 10 ],
		points[ 16 * 0 + 10 ], false, true ) );
faces.push( new Face(
		points[ 16 * 3 + 14 ],
		points[ 16 * 3 + 13 ],
		points[ 16 * 1 + 14 ],
		points[ 16 * 1 + 13 ], true, true ) );
faces.push( new Face(
		points[ 16 * 2 + 14 ],
		points[ 16 * 2 + 13 ],
		points[ 16 * 0 + 14 ],
		points[ 16 * 0 + 13 ], true, true ) );

function rotate( x, y, z, sin, cos, isCover ){
	
	var x1 = x;
	x = x * cos - z * sin;
	z = z * cos + x1 * sin;
	
	return new Point( x, y, z, isCover );
}

function Point( x, y, z, isCover ){
	
	this.x = x;
	this.y = y;
	this.z = z;
	this.isCover = isCover;
	
	this.x *= opts.base;
	this.y *= opts.height;
	this.z *= opts.base;
	
	this.screen = {
		x: 0,
		y: 0,
		z: 0
	};
	
	this.transformed = {
		x: 0,
		y: 0,
		z: 0
	};
}
Point.prototype.setScreen = function(){
	
	// rotate everything in the Y, permanently
	
	var x1 = this.x;
	this.x = this.x * calc.rotYcos - this.z * calc.rotYsin;
	this.z = this.z * calc.rotYcos + x1 * calc.rotYsin;
	
	var x = this.x,
			y = this.y,
			z = this.z;
	
	// if it's a top piece, add what needs to be added;
	if( this.isCover )
		y += opts.coverAddedOffset * proportion;
	
	// then rotate temporarily in the X
	var y1 = y;
	y = y * calc.rotXcos - z * calc.rotXsin;
	z = z * calc.rotXcos + y1 * calc.rotXsin;
	
	// and add the depth
	z += opts.depth;
	
	// now just calculate the screen position
	var scale = opts.focalLength / z;
	this.screen.x = opts.vanishPoint.x + scale * x;
	this.screen.y = opts.vanishPoint.y + scale * y;
	this.screen.z = z; // used for z-indexing
	
	this.transformed.x = x;
	this.transformed.y = y;
	this.transformed.z = z;
}
function Face( p1, p2, p3, p4, takesPrecedence, isCover ){
	
	this.points = [ p1, p2, p3, p4 ];
	
	this.takesPrecedence = takesPrecedence;
	this.isCover = isCover;
	
	this.color = takesPrecedence ? opts.colors[ 1 ] : opts.colors[ 0 ];
	this.closest = this.points[ 0 ];
}
Face.prototype.setClosestPoint = function(){
	
	var closest = this.points[ 0 ];
	for( var i = 1; i < this.points.length; ++i )
		if( this.points[ i ].screen.z < closest.screen.z )
			closest = this.points[ i ];
	
	this.closest = closest;
} 
Face.prototype.isFrontFace = function(){
	
	var P = this.points[ 0 ].transformed,
			u = {
				x: this.points[ 1 ].transformed.x - P.x,
				y: this.points[ 1 ].transformed.y - P.y,
				z: this.points[ 1 ].transformed.z - P.z
			},
			v = {
				x: this.points[ 2 ].transformed.x - P.x,
				y: this.points[ 2 ].transformed.y - P.y,
				z: this.points[ 2 ].transformed.z - P.z
			},
			normal = {
				x: u.y*v.z - u.z*v.y,
				y: u.z*v.x - u.x*v.z,
				z: u.x*v.y - u.y*v.x
			};
	
	return ( normal.x * P.x + normal.y * P.y + normal.z * P.z ) >= 0; 
}
Face.prototype.draw = function(){
	
	if( !this.isFrontFace() ) return 0;
	
	ctx.fillStyle = this.color;
	ctx.beginPath();
	ctx.moveTo( this.points[ 0 ].screen.x, this.points[ 0 ].screen.y );
	for( var i = 1; i < this.points.length; ++i )
		ctx.lineTo( this.points[ i ].screen.x, this.points[ i ].screen.y );
	
	ctx.fill();
}

function anim(){
	
	window.requestAnimationFrame( anim );
	
	ctx.fillStyle = '#666';
	ctx.fillRect( 0, 0, s, s );
	
	ctx.fillStyle = '#aaa';
	ctx.fillRect( 0, s / 2, s, s / 2 );
	
	if( hovering ){
		
		linearProportion += opts.linearIncrement;
		
		if( linearProportion > 1 ){
			
			linearProportion = 1;
			proportion = 1;
			
		} else 
			proportion = -Math.cos( linearProportion * Math.PI ) / 2 + .5;
		
	} else if( linearProportion > 0 ){
		
		linearProportion -= opts.linearIncrement;
		
		if( linearProportion < 0 ){
			
			linearProportion = 0;
			proportion = 0;
		
		} else
			proportion = -Math.cos( linearProportion * Math.PI ) / 2 + .5;
	}
	
	points.map( function( point ){ point.setScreen(); } );
	faces.map( function( face ){ face.setClosestPoint(); } );
	faces.sort( function( a, b ){
		
		var pa = a.takesPrecedence,
				pb = b.takesPrecedence,
				ca = a.isCover,
				cb = b.isCover;
		
		if( ca && !cb )
			return 1;
		else if( !ca && cb )
			return -1;
		else {
			if( pa && !pb )
				return 1;
			else if( !pa && pb )
				return -1;
			else if( !pa && !pb )
				return b.closest.screen.z - a.closest.screen.z;
			else return 0;
		}
	});
	faces.map( function( face ){ face.draw(); } );
	
}
anim();

span.addEventListener( 'mouseenter', function(){
	
	hovering = true;
});
span.addEventListener( 'mouseleave', function(){
	
	hovering = false;
});
span.addEventListener( 'click', function(){
	
	window.open( 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' );
})