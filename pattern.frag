#version 120
//refraction coefficient
uniform float		uEta;

//mixing factors of refraction and reflection
uniform float 		uMix;
uniform float 		uWhiteMix;

uniform samplerCube uReflectUnit;
uniform samplerCube uRefractUnit;

uniform float uKa, uKd, uKs; 

//model coordinates
varying vec3	vMC;

//normal vector 
varying vec3	vNs;

//eye vector
varying vec3	vEs;

//texture coordinates
varying vec2	vST;

//light vector
varying vec3 vL; 

// these have to be set dynamically from glman sliders or keytime animations:
uniform float uAd=0.5;
uniform float uBd=0.5;

// specular exponent
uniform float uShininess; 

void
main( )
{
  //Normalize normal, eye, and light vectors
	vec3 Normal = normalize(vNs);
	vec3 Eye =    normalize(vEs);
  vec3 Light = normalize(vL);

  //initialize color and specular color variables
  vec3 myColor=vec3(0.0,0.0,0.0);
	vec3 mySpecularColor = vec3(1.,1.,1.);	// whatever default color you'd like
	
  //from Project 1
  float Ar = uAd/2.;
	float Br = uBd/2.;

	int numins = int( vST.s / uAd ); 
	int numint = int( vST.t / uBd ); 
	
  float sc = float(numins) *uAd + Ar; 
	float tc = float(numint) *uBd + Br;

  float ds = ( vST.s - sc ) / Ar;
	float dt=(vST.t-tc)/Br;	
	float results_of_ellipse_equation = (ds * ds) + (dt * dt);
	
  //making the colors
	if(results_of_ellipse_equation<=1.0){
    myColor=vec3(0.,0.,0.);
  }
   
  else{
    Normal = normalize( gl_NormalMatrix * Normal );

    //calculate reflection vector
    vec3 reflectVector = reflect(Eye, Normal );

    //calculate the color of the reflection vector
    vec3 reflectColor = textureCube( uReflectUnit, reflectVector ).rgb;

    //calculate the refract vector
    vec3 refractVector = refract( Eye, Normal, uEta ); 
    
    vec3 refractColor;

    //if the refraction unit is facing the same direction as the incoming light
    if(all( equal( refractVector, vec3(0.,0.,0.) ) ) ){
      refractColor = reflectColor;
    } 

    refractColor = textureCube( uRefractUnit, refractVector ).rgb; 
    refractColor = mix(refractColor, vec3( 1.,1.,1.), uWhiteMix );

    vec3 color = mix( refractColor, reflectColor, uMix ); 
    color = mix( color, vec3( 1.,1.,1.), uWhiteMix ); 
    gl_FragColor = vec4(color, 1. );
  }
 
}