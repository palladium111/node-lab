"use client";

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import type { Node, Edge, Settings } from '@/types';
import type { useGraphState } from '@/hooks/use-graph-state';

type GraphState = ReturnType<typeof useGraphState>;

const defaultEdgeColor = 0x9ca3af;
const outgoingEdgeColor = 0x22c55e;
const incomingEdgeColor = 0xef4444;
const bidirectionalEdgeColor = 0x3b82f6;

export function GraphVisualization({
    nodes, edges, settings, selectedNode, physicsEnabled, clusterBy, colorBy, propertyColorMap, clusterCenters,
    scene, setScene, world, setWorld, handleNodeClick,
}: GraphState) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef<{
        camera?: THREE.PerspectiveCamera,
        renderer?: THREE.WebGLRenderer,
        orbitControls?: OrbitControls,
        dragControls?: DragControls,
        clusterCenterMeshes: THREE.Mesh[],
    }>({ clusterCenterMeshes: [] });

    useEffect(() => {
        if (!containerRef.current || stateRef.current.renderer) return;

        const container = containerRef.current;
        const localScene = new THREE.Scene();
        localScene.background = new THREE.Color(0x1F2937);
        setScene(localScene);

        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 50;
        stateRef.current.camera = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        stateRef.current.renderer = renderer;

        const localWorld = new CANNON.World();
        localWorld.gravity.set(0, 0, 0);
        localWorld.broadphase = new CANNON.NaiveBroadphase();
        localWorld.solver.iterations = 10;
        setWorld(localWorld);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        localScene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        localScene.add(directionalLight);

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        stateRef.current.orbitControls = orbitControls;

        const handleResize = () => {
            if (!renderer || !camera) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const handleCanvasClick = (event: MouseEvent) => {
            if (event.target !== renderer.domElement) return;
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(nodes.map(n => n.mesh));
            if (intersects.length > 0) {
                const intersectedNode = nodes.find(n => n.mesh === intersects[0].object);
                if (intersectedNode) {
                    handleNodeClick(intersectedNode.id);
                }
            }
        };
        container.addEventListener('click', handleCanvasClick);
        
        const timeStep = 1 / 60;
        const animate = () => {
            requestAnimationFrame(animate);
            orbitControls.update();

            if (physicsEnabled && localWorld) {
                // Physics calculations...
                edges.forEach(edge => {
                    const { startNode, endNode } = edge;
                    if (!startNode.physicsBody || !endNode.physicsBody) return;
                    const vec = startNode.physicsBody.position.vsub(endNode.physicsBody.position);
                    const displacement = vec.length() - settings.connectionLength;
                    const forceMagnitude = settings.connectionStiffness * displacement * 0.01;
                    vec.normalize();
                    const forceVec = vec.scale(forceMagnitude, new CANNON.Vec3());
                    endNode.physicsBody.applyForce(forceVec, endNode.physicsBody.position);
                    startNode.physicsBody.applyForce(forceVec.negate(), startNode.physicsBody.position);
                });

                nodes.forEach(nodeA => {
                    if (clusterBy !== 'none' && clusterCenters[nodeA.properties[clusterBy]]) {
                         const center = clusterCenters[nodeA.properties[clusterBy]];
                         const force = center.vsub(nodeA.physicsBody.position);
                         force.scale(settings.clusterAttraction, force);
                         nodeA.physicsBody.applyForce(force, nodeA.physicsBody.position);
                    }
                     nodes.forEach(nodeB => {
                        if (nodeA === nodeB) return;
                        const vec = nodeA.physicsBody.position.vsub(nodeB.physicsBody.position);
                        const distSq = vec.lengthSquared();
                        if (distSq > 0) {
                            const forceMag = settings.repulsionStrength / Math.max(0.1, distSq);
                            vec.normalize();
                            vec.scale(forceMag, vec);
                            nodeA.physicsBody.applyForce(vec, nodeA.physicsBody.position);
                        }
                    });
                });
                
                localWorld.step(timeStep);
                nodes.forEach(n => {
                    n.mesh.position.copy(n.physicsBody.position as any);
                    n.mesh.quaternion.copy(n.physicsBody.quaternion as any);
                });
            }

            edges.forEach(e => {
                const pos = e.mesh.geometry.attributes.position;
                pos.setXYZ(0, e.startNode.mesh.position.x, e.startNode.mesh.position.y, e.startNode.mesh.position.z);
                pos.setXYZ(1, e.endNode.mesh.position.x, e.endNode.mesh.position.y, e.endNode.mesh.position.z);
                pos.needsUpdate = true;
            });
            
            stateRef.current.clusterCenterMeshes.forEach(mesh => mesh.lookAt(camera.position));
            renderer.render(localScene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('click', handleCanvasClick);
            container.removeChild(renderer.domElement);
            // Dispose Three.js objects
        };
    }, [setScene, setWorld]);

    useEffect(() => {
        if (!stateRef.current.renderer || !stateRef.current.camera) return;
        if (stateRef.current.dragControls) {
            stateRef.current.dragControls.dispose();
        }
        const nodeObjects = nodes.map(n => n.mesh);
        if (nodeObjects.length > 0) {
            const dragControls = new DragControls(nodeObjects, stateRef.current.camera, stateRef.current.renderer.domElement);
            dragControls.addEventListener('dragstart', (e) => {
                if(stateRef.current.orbitControls) stateRef.current.orbitControls.enabled = false;
                const node = nodes.find(n => n.mesh === e.object);
                if (node) {
                    handleNodeClick(node.id);
                    if (physicsEnabled) node.physicsBody.type = CANNON.Body.STATIC;
                }
            });
            dragControls.addEventListener('drag', (e) => {
                const node = nodes.find(n => n.mesh === e.object);
                if (node && physicsEnabled) {
                    node.physicsBody.position.copy(e.object.position as any);
                    node.physicsBody.velocity.set(0,0,0);
                }
            });
            dragControls.addEventListener('dragend', (e) => {
                if(stateRef.current.orbitControls) stateRef.current.orbitControls.enabled = true;
                const node = nodes.find(n => n.mesh === e.object);
                if (node && physicsEnabled) {
                    node.physicsBody.type = CANNON.Body.DYNAMIC;
                    node.physicsBody.wakeUp();
                }
            });
            stateRef.current.dragControls = dragControls;
        }
    }, [nodes, physicsEnabled, handleNodeClick]);
    
    // Node style updates
    useEffect(() => {
        nodes.forEach(node => {
            // Color
            const value = node.properties[colorBy];
            const color = colorBy === 'none' ? 0xcccccc : (propertyColorMap[colorBy]?.[value] || 0x4b5563);
            (node.mesh.material as THREE.MeshPhongMaterial).color.set(color);

            // Scale
            const scale = selectedNode?.id === node.id ? 1.5 : 1;
            node.mesh.scale.set(scale, scale, scale);
        });
    }, [nodes, colorBy, propertyColorMap, selectedNode]);

    // Edge style updates
    useEffect(() => {
        edges.forEach(edge => {
            let color = defaultEdgeColor;
            let width = 1;
            let opacity = 0.7;
            if (selectedNode) {
                 const outgoing = edge.startNode.id === selectedNode.id;
                 const incoming = edge.endNode.id === selectedNode.id;
                 if(outgoing || incoming) {
                    const peerId = outgoing ? edge.endNode.id : edge.startNode.id;
                    const isBidirectional = edges.some(e => e.startNode.id === peerId && e.endNode.id === selectedNode.id);
                    if(outgoing && isBidirectional) color = bidirectionalEdgeColor;
                    else if(outgoing) color = outgoingEdgeColor;
                    else if(incoming) color = incomingEdgeColor;
                    width = 2.5;
                    opacity = 1;
                 }
            }
            (edge.mesh.material as THREE.LineBasicMaterial).color.set(color);
            (edge.mesh.material as THREE.LineBasicMaterial).linewidth = width;
            (edge.mesh.material as THREE.LineBasicMaterial).opacity = opacity;
        });
    }, [edges, selectedNode]);

    // Cluster centers visualization
    useEffect(() => {
        if (!scene || !stateRef.current.camera) return;

        stateRef.current.clusterCenterMeshes.forEach(mesh => scene.remove(mesh));
        stateRef.current.clusterCenterMeshes = [];
        
        if (clusterBy !== 'none') {
             Object.entries(clusterCenters).forEach(([value, centerVec]) => {
                const colorKey = colorBy === 'none' ? clusterBy : colorBy;
                const centerColor = new THREE.Color(propertyColorMap[colorKey]?.[value] || 0xaaaaaa);
                
                const centerGeometry = new THREE.TorusGeometry(2, 0.1, 16, 100);
                const centerMaterial = new THREE.MeshBasicMaterial({ color: centerColor, transparent: true, opacity: 0.5 });
                const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial);
                centerMesh.position.copy(centerVec as any);
                scene.add(centerMesh);
                stateRef.current.clusterCenterMeshes.push(centerMesh);
            });
        }
    }, [clusterCenters, clusterBy, colorBy, propertyColorMap, scene]);

    return <div ref={containerRef} className="w-full h-full" />;
}
