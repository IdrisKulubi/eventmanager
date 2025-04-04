/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      directionalLight: any;
      hemisphereLight: any;
      
      // Geometries
      boxGeometry: any;
      sphereGeometry: any;
      planeGeometry: any;
      torusGeometry: any;
      torusKnotGeometry: any;
      circleGeometry: any;
      coneGeometry: any;
      cylinderGeometry: any;
      
      // Materials
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      meshPhongMaterial: any;
      meshLambertMaterial: any;
      meshNormalMaterial: any;
      meshDepthMaterial: any;
      meshDistanceMaterial: any;
      meshMatcapMaterial: any;
      meshToonMaterial: any;
      lineBasicMaterial: any;
      lineDashedMaterial: any;
      pointsMaterial: any;
      spriteMaterial: any;
      rawShaderMaterial: any;
      shaderMaterial: any;
    }
  }
} 