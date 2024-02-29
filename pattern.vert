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

	// Calculate the derivative of the surface function with respect to r
	float e=-sin(2.*PI*uB*r+uC) * (2.*PI*uB * exp(-uD*r)) + (cos(2.*PI*uB*r+uC) * -uD * exp(-uD*r)); 

	// Calculate the derivative of z with respect to r
	float dzdr = uA * e;

	// Update the z-coordinate of the vertex
	vec4 newVertex = gl_Vertex;
	newVertex.z =uA * cos(2*PI*uB*r+uC)*exp(-uD*r);

	 // Transform vertex to eye coordinates
	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex; ;

	// Calculate the derivatives of z with respect to x and y
	float dzdx = dzdr * drdx;
	float dzdy = dzdr * drdy;
	
	// Calculate tangent vectors in the x and y directions
	vec3 xtangent = vec3(1., 0., dzdx );
	vec3 ytangent = vec3(0., 1., dzdy );

	// Calculate the new normal vector
	vec3 newNormal =normalize( cross(xtangent, ytangent ));
	vNs = newNormal;

	 // Calculate the eye vector
	vEs = ECposition.xyz - vec3( 0., 0., 0. ) ; 
	
	// Calculate the light vector
	vL = LIGHTPOSITION - ECposition.xyz; 
		
	//makes the dragon 3D
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
