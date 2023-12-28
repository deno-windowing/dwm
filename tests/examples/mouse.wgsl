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

fn seconds() -> f32 {
  return shaderplay.frame / 60.;
}

@fragment 
fn fs_main( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  // get normalized texture coordinates (aka uv) in range 0-1
  let npos  = uvN( pos.xy );
  let red   = npos.x / shaderplay.mouse.x;
  let green = npos.y / shaderplay.mouse.y;
  let blue  = .5 + sin( seconds() ) * .5;
  return vec4f( red, green, blue, 1. );
}
