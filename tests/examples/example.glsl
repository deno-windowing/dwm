// example.glsl
#version 450

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                * 43758.5453123);
}

layout(location = 0) out vec4 outColor;

void main() {
    vec2 st = gl_FragCoord.xy / 512;
    st.x *= 512 / 512;
    float r = random(st * 2.0);

    outColor = vec4(vec3(r), 1.0);
}
