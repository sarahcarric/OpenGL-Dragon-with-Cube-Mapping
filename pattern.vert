#version 120
uniform float uA, uB, uD;
float uC=0.0;
const float PI= 2.*3.14159265;

varying vec3	vNs;
varying vec3	vEs;
varying vec3	vMC;
varying vec3 vL; 
const vec3 LIGHTPOSITION = vec3( 2., 2., 2. );
varying vec2	vST;

void
main( )
{    
	vMC = gl_Vertex.xyz;
	float x=gl_Vertex.x;
	float y=gl_Vertex.y;
	vST = gl_MultiTexCoord0.st;
	float r = sqrt((x*x)+(y*y));
	float drdx=x/r;
	float drdy=y/r;


	float e=-sin(2.*PI*uB*r+uC) * (2.*PI*uB * exp(-uD*r)) + (cos(2.*PI*uB*r+uC) * -uD * exp(-uD*r)); 

	float dzdr = uA * e;
	vec4 newVertex = gl_Vertex;
	newVertex.z =uA * cos(2*PI*uB*r+uC)*exp(-uD*r);

	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex; ;

		
	float dzdx = dzdr * drdx;
	float dzdy = dzdr * drdy;
		
	vec3 xtangent = vec3(1., 0., dzdx );
	vec3 ytangent = vec3(0., 1., dzdy );

	vec3 newNormal =normalize( cross(xtangent, ytangent ));
	vNs = newNormal;
	vEs = ECposition.xyz - vec3( 0., 0., 0. ) ; 
					// vector from the eye position to the point
	vL = LIGHTPOSITION - ECposition.xyz; 
		
	//makes the dragon 3D
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
