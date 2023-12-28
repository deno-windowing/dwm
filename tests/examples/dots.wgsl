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
  let p     = uvN( pos.xy );
  let tiled = fract( p * 10. );

  let circles   = distance( tiled, vec2(.5) );
  let threshold = smoothstep( .25,.275, circles );

  return vec4f( 1. - threshold );
}
