struct VertexInput {
    @builtin(vertex_index) vertex_index: u32,
};

@vertex
fn vs_main(in: VertexInput) -> @builtin(position) vec4<f32> {
    let x = f32(i32(in.vertex_index) - 1);
    let y = f32(i32(in.vertex_index & 1u) * 2 - 1);
    return vec4<f32>(x, y, 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
