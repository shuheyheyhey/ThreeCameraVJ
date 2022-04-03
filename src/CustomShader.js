/**
 * Full-screen textured quad shader
 */

const CustomShader = {

  uniforms: {
    'tDiffuse': {},
    'opacity': { value: 1.0 },
    'time': { value: 0.0 },
    'audio': { value: 0.0 }
  },

  vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

  fragmentShader: /* glsl */`
		uniform float opacity;
		uniform sampler2D tDiffuse;
        uniform float time;
        uniform float audio;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
            texel = vec4(sin(cos(audio*texel.x) * 2.*texel.y * audio), cos(sin(audio*texel.y) * 2.*texel.x * audio), cos(sin(audio*texel.z) * 2.*texel.y * audio), .0);

            gl_FragColor = 1. - opacity * fract(texel * max(audio, 5.));
		}`

};

export { CustomShader };
