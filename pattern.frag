#version 120
uniform sampler3D	Noise3;
uniform float 		uNoiseAmp;
uniform float 		uNoiseFreq;
uniform float		uEta;
uniform float 		uMix;
uniform float 		uWhiteMix;
uniform samplerCube uReflectUnit;
uniform samplerCube uRefractUnit;

varying vec3	vMC;
varying vec3	vNs;
varying vec3	vEs;
varying vec2	vST;

const vec3  WHITE = vec3( 1.,1.,1.);

vec3
RotateNormal( float angx, float angy, vec3 n )
{
	float cx = cos( angx );
	float sx = sin( angx );
	float cy = cos( angy );
	float sy = sin( angy );
	
	// rotate about x:
	float yp =  n.y*cx - n.z*sx;	// y'
	n.z      =  n.y*sx + n.z*cx;	// z'
	n.y      =  yp;

	// rotate about y:
	float xp =  n.x*cy + n.z*sy;	// x'
	n.z      = -n.x*sy + n.z*cy;	// z'
	n.x      =  xp;

	return normalize( n );
}


void
main( )
{
	vec3 Normal = normalize(vNs);
	vec3 Eye =    normalize(vEs);

	vec4 nvx = texture3D( Noise3, uNoiseFreq*vMC );
	vec4 nvy = texture3D( Noise3, uNoiseFreq*vec3(vMC.xy,vMC.z+0.5) );

	float angx = nvx.r + nvx.g + nvx.b + nvx.a;	//  1. -> 3.
	angx = angx - 2.;				// -1. -> 1.
	angx *= uNoiseAmp;

	float angy = nvy.r + nvy.g + nvy.b + nvy.a;	//  1. -> 3.
	angy = angy - 2.;				// -1. -> 1.
	angy *= uNoiseAmp;

	Normal = RotateNormal( angx, angy, Normal );
	Normal = normalize( gl_NormalMatrix * Normal );

	vec3 reflectVector = reflect(Eye, Normal );
	vec3 reflectColor = textureCube( uReflectUnit, reflectVector ).rgb;


	vec3 refractVector = refract( Eye, Normal, uEta ); 
	
	vec3 refractColor;
	if(all( equal( refractVector, vec3(0.,0.,0.) ) ) ){
		refractColor = reflectColor;
	} 
	
	refractColor = textureCube( uRefractUnit, refractVector ).rgb; 
	refractColor = mix(refractColor, WHITE, uWhiteMix );

	vec3 color = mix( refractColor, reflectColor, uMix ); 
	color = mix( color, WHITE, uWhiteMix ); 
	gl_FragColor = vec4(color, 1. );
}