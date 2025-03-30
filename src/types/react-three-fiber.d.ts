import * as THREE from 'three';
import '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    group: JSX.IntrinsicElements['group'] & { children?: React.ReactNode };
    mesh: JSX.IntrinsicElements['mesh'] & { children?: React.ReactNode };
    spotLight: JSX.IntrinsicElements['spotLight'] & { children?: React.ReactNode };
    ambientLight: JSX.IntrinsicElements['ambientLight'] & { children?: React.ReactNode };
    boxGeometry: JSX.IntrinsicElements['boxGeometry'] & { children?: React.ReactNode };
    planeGeometry: JSX.IntrinsicElements['planeGeometry'] & { children?: React.ReactNode };
    circleGeometry: JSX.IntrinsicElements['circleGeometry'] & { children?: React.ReactNode };
    coneGeometry: JSX.IntrinsicElements['coneGeometry'] & { children?: React.ReactNode };
    torusKnotGeometry: JSX.IntrinsicElements['torusKnotGeometry'] & { children?: React.ReactNode };
    meshStandardMaterial: JSX.IntrinsicElements['meshStandardMaterial'] & { children?: React.ReactNode };
    meshBasicMaterial: JSX.IntrinsicElements['meshBasicMaterial'] & { children?: React.ReactNode };
    shaderMaterial: JSX.IntrinsicElements['shaderMaterial'] & { children?: React.ReactNode };
  }
} 