varying vec3 fragPos;
//got this from https://github.com/MaxBittker/glsl-voronoi-noise/blob/master/3d.glsl
vec3 genPsuedoRandom(vec3 pos){
	 return fract(
       sin(vec3(dot(pos, vec3(1.0, 57.0, 113.0)), 
	   dot(pos, vec3(57.0, 113.0, 1.0)), 
	   dot(pos, vec3(113.0, 1.0, 57.0)))) *
       	 43758.5453);
}

vec3 voronoi3d(vec3 samPoint) {
  vec3 gridPoint = floor(samPoint);
  vec3 fraction = fract(samPoint);

  float id = 0.0;
  vec2 result = vec2(100.0);
 
  for (int k = -1; k <= 1; k++) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        
		vec3 offset = vec3(float(i), float(j), float(k));
        vec3 cellPoint = vec3(offset) - fraction + genPsuedoRandom(gridPoint + offset);
        float distance = dot(cellPoint, cellPoint);

        float condition = max(sign(result.x - distance), 0.0);
        float invertCond = 1.0 - condition;

       	float condition2 = invertCond * max(sign(result.y - distance), 0.0);
        float invertCond2 = 1.0 - condition2;

       	id = (dot(gridPoint + offset, vec3(1.0, 57.0, 113.0)) * condition) + (id * invertCond);
       	result = vec2(distance, result.x) * condition + result * invertCond;

       result.y = condition2 * distance + invertCond2 * result.y;
     }
    }
  }

	return vec3(sqrt(result), abs(id));
}


// lighting uniform variables -- these can be set once and left alone:
uniform float   uKa, uKd, uKs;	 // coefficients of each type of lighting -- make sum to 1.0
uniform vec3    uColor;		 // object color
uniform vec3    uSpecularColor;	 // light color
uniform float   uShininess;	 // specular exponent

// square-equation uniform variables -- these should be set every time Display( ) is called:

uniform float   uS0, uT0, uD;

// in variables from the vertex shader and interpolated in the rasterizer:

varying  vec3  vN;		   // normal vector
varying  vec3  vL;		   // vector from point to light
varying  vec3  vE;		   // vector from point to eye
varying  vec2  vST;		   // (s,t) texture coordinates


void
main( )
{
	float s = vST.s;
	float t = vST.t;

	// determine the color using the square-boundary equations:

	vec3 myColor = uColor;

	// apply the per-fragmewnt lighting to myColor:

	vec3 Normal = normalize(vN);
	vec3 Light  = normalize(vL);
	vec3 Eye    = normalize(vE);
	vec3 fragPosNormalized = normalize(fragPos);
    vec3 voronoiResult = voronoi3d(fragPosNormalized);

    gl_FragColor= vec4(voronoiResult, 1.0);
}

