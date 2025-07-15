import type * as THREE from 'three';
import type * as CANNON from 'cannon-es';

export interface Node {
  id: string;
  name: string;
  properties: { [key: string]: any };
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhongMaterial>;
  physicsBody: CANNON.Body;
}

export interface Edge {
  id: string;
  startNode: Node;
  endNode: Node;
  mesh: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
}

export interface Settings {
  clusterLayout: 'circle' | 'sphere';
  minConnections: number;
  maxConnections: number;
  cityAffinity: number;
  languageAffinity: number;
  clusterAttraction: number;
  repulsionStrength: number;
  connectionLength: number;
  connectionStiffness: number;
  clusterRadius: number;
  damping: number;
}
