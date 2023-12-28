fn uvN( pos: vec2f ) -> vec2f {
  return pos.xy / vec2f(512.0, 512.0);
}

@vertex
fn vs_main(@builtin(vertex_index) in: u32) -> @builtin(position) vec4<f32> {
    var vertices = array<vec2<f32>, 3>(
        vec2<f32>(-1., 1.),
        vec2<f32>(3.0, 1.),
        vec2<f32>(-1., -3.0),
    );
    return vec4<f32>(vertices[in], 0.0, 1.0);
}

@fragment 
fn fs_main( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  var p : vec2f = uvN( pos.xy );
  p.y -= .5;

  var color: f32 = 0.;
  
  for( var i:f32 = 1.; i < 15.; i+= 1. ) {
    p.y += sin( (p.x / i*8.) + (p.x + (shaderplay.frame/((.1+shaderplay.mouse.x)*120.))) * i ) * shaderplay.mouse.y * .5; 
    color += abs( .00125 / p.y );
  }

  let out = vec4f( p.x, color, color, 1.);
  return select( 1.-out, out, shaderplay.clicked == 0. );
}
