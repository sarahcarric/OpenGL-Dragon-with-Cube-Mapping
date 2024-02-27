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


float uAd=0.2; 
float uBd=0.2;
float uTol=0.5;
uniform float uNoiseAmp,uNoiseFreq;
uniform bool uUseXYZforNoise;
const vec3 ORANGE = vec3( 1., .5, 0. );
const vec3 WHITE  = vec3( 1., 1., 1.);
uniform sampler3D Noise3;
varying vec3 vMCposition;
vec4 nv;




void
main( )
{
	//taken from assignment description
	if(uUseXYZforNoise){
 		nv=texture3D(Noise3, uNoiseFreq * vMCposition);
	}
	else{
			nv=texture3D(Noise3, uNoiseFreq* vec3(vST,0.));
	}
	float n= nv.r+ nv.g + nv.b + nv.a; 
	
	n = n - 2.;
	n*=uNoiseAmp;


	vec3 Normal = normalize(vN);
	vec3 Light = normalize(vL);
	vec3 Eye = normalize(vE);
	vec3 myColor=vec3(0.0,1.0,0.0);
	vec3 mySpecularColor = vec3(1.,1.,1.);	// whatever default color you'd like

	//all from last assignment
	float Ar = uAd/2.;
	float Br = uBd/2.;
	
	int numins = int( vST.s / uAd ); 
	int numint = int( vST.t / uBd ); 
	
	float sc = float(numins) *uAd + Ar; 
	float tc = float(numint) *uBd + Br;
	
	float ds = ( vST.s - sc );
	float dt=(vST.t-tc);
	
	float oldDist = sqrt((ds*ds) + (dt*dt)); 
	float newDist = oldDist + n;

	float scale = newDist / oldDist;

	ds *= scale;
	ds /= Ar;
	dt *= scale;
	dt /= Br;

	float d = (ds * ds) + (dt * dt);
	
	float t = smoothstep( 1. - uTol, 1. + uTol, d);
	
	myColor = mix( ORANGE, WHITE, t );


	vec3 ambient = uKa * myColor;

	float dd = max( dot(Normal,Light), 0. );       // only do diffuse if the light can see the point
	vec3 diffuse = uKd * dd * myColor;

	float ss = 0.;
	if( dot(Normal,Light) > 0. )	      // only do specular if the light can see the point
	{
		vec3 ref = normalize(  reflect( -Light, Normal )  );
		ss = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec3 specular = uKs * ss * uSpecularColor;
	gl_FragColor = vec4( ambient + diffuse + specular,  1. );
}


