
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import type { Node, Edge, Settings } from '@/types';
import { sampleNodesData } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";

const defaultSettings: Settings = {
    showNodeLabels: true,
    clusterLayout: 'circle',
    minConnections: 1,
    maxConnections: 3,
    cityAffinity: 0.5,
    languageAffinity: 0.7,
    clusterAttraction: 1.0,
    repulsionStrength: 20.0,
    connectionLength: 4,
    connectionStiffness: 50,
    clusterRadius: 25,
    damping: 0.9,
};

const colorPalette = [0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd, 0x8c564b, 0xe377c2, 0x7f7f7f, 0xbcbd22, 0x17becf];

function createLabelSprite(text: string) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    const fontSize = 48;
    context.font = `Bold ${fontSize}px Arial`;
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;

    canvas.width = textWidth + 20; // some padding
    canvas.height = fontSize + 10; // some padding

    context.font = `Bold ${fontSize}px Arial`;
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    sprite.scale.set(canvas.width / 50, canvas.height / 50, 1.0);
    return sprite;
}


function createInitialNodes(scene: THREE.Scene, world: CANNON.World, settings: Settings): Node[] {
    return sampleNodesData.map(n => {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const initialPos = new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        mesh.position.copy(initialPos);
        
        const shape = new CANNON.Sphere(1);
        const physicsBody = new CANNON.Body({ mass: 1, linearDamping: settings.damping, angularDamping: settings.damping });
        physicsBody.addShape(shape);
        physicsBody.position.copy(initialPos as any);
        
        world.addBody(physicsBody);
        scene.add(mesh);

        const labelSprite = createLabelSprite(n.name);
        if (labelSprite) {
            labelSprite.position.set(initialPos.x, initialPos.y + 2, initialPos.z);
            scene.add(labelSprite);
        }

        return { id: THREE.MathUtils.generateUUID(), name: n.name, mesh, properties: n.properties, physicsBody, labelSprite };
    });
}

function createEdges(nodes: Node[], settings: Settings, scene: THREE.Scene): Edge[] {
    let newEdges: Edge[] = [];
    if (nodes.length < 2 || !scene) return newEdges;

    const connectionCounts = new Map<string, number>(nodes.map(n => [n.id, 0]));

    const createEdgeInternal = (nodeA: Node, nodeB: Node) => {
        if (!scene || !nodeA.mesh || !nodeB.mesh || nodeA === nodeB || newEdges.some(e => 
            (e.startNode.id === nodeA.id && e.endNode.id === nodeB.id) || 
            (e.startNode.id === nodeB.id && e.endNode.id === nodeA.id)
        )) return false;

        const material = new THREE.LineBasicMaterial({ color: 0x9ca3af, linewidth: 1, transparent: true, opacity: 0.7 });
        const geometry = new THREE.BufferGeometry().setFromPoints([nodeA.mesh.position, nodeB.mesh.position]);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        newEdges.push({ id: THREE.MathUtils.generateUUID(), startNode: nodeA, endNode: nodeB, mesh: line });
        
        connectionCounts.set(nodeA.id, (connectionCounts.get(nodeA.id) || 0) + 1);
        connectionCounts.set(nodeB.id, (connectionCounts.get(nodeB.id) || 0) + 1);
        return true;
    }

    // --- Phase 1: Enforce Minimum Connections ---
    let attempts = 0;
    const maxAttempts = nodes.length * nodes.length; // Safety break

    while(attempts < maxAttempts) {
        let allNodesMeetMin = true;
        
        // Find all nodes that are below the minimum connection count
        const nodesBelowMin = nodes.filter(n => (connectionCounts.get(n.id) || 0) < settings.minConnections);

        if(nodesBelowMin.length === 0) {
            break; // All nodes meet the minimum, exit loop
        }
        allNodesMeetMin = false;
        
        for (const nodeA of nodesBelowMin) {
            // Check again in case it was connected in a previous iteration of this loop
            if ((connectionCounts.get(nodeA.id) || 0) >= settings.minConnections) continue;

            const potentialTargets = nodes.filter(nodeB => 
                nodeA.id !== nodeB.id && 
                (connectionCounts.get(nodeB.id) || 0) < settings.maxConnections &&
                !newEdges.some(e => (e.startNode.id === nodeA.id && e.endNode.id === nodeB.id) || (e.startNode.id === nodeB.id && e.endNode.id === nodeA.id))
            );

            if (potentialTargets.length > 0) {
                // Try to find a target that is also below min connections first
                let targetNode = potentialTargets.find(n => (connectionCounts.get(n.id) || 0) < settings.minConnections);
                // If not found, pick a random one
                if (!targetNode) {
                    targetNode = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                }
                createEdgeInternal(nodeA, targetNode);
            }
        }
        
        if (allNodesMeetMin) break;
        attempts++;
    }


    // --- Phase 2: Add Affinity-Based Connections ---
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];
            if ((connectionCounts.get(nodeA.id) || 0) >= settings.maxConnections || 
                (connectionCounts.get(nodeB.id) || 0) >= settings.maxConnections) continue;

            let probability = 0.05; // Base probability
            if (nodeA.properties.city && nodeA.properties.city === nodeB.properties.city) probability += settings.cityAffinity;
            if (nodeA.properties.language && nodeA.properties.language === nodeB.properties.language) probability += settings.languageAffinity;
            
            if (Math.random() < probability) {
               createEdgeInternal(nodeA, nodeB);
            }
        }
    }
    return newEdges;
}

export function useGraphState() {
    const { toast } = useToast();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStartNodeId, setConnectionStartNodeId] = useState<string | null>(null);
    const [physicsEnabled, setPhysicsEnabled] = useState(true);
    const [clusterBy, setClusterBy] = useState('city');
    const [colorBy, setColorBy] = useState('language');
    const [isAddNodeModalOpen, setAddNodeModalOpen] = useState(false);
    const [isPhysicsSettingsModalOpen, setPhysicsSettingsModalOpen] = useState(false);
    const [isGenerationSettingsModalOpen, setGenerationSettingsModalOpen] = useState(false);
    
    const [scene, setScene] = useState<THREE.Scene | null>(null);
    const [world, setWorld] = useState<CANNON.World | null>(null);
    
    // Initial setup
    useEffect(() => {
        if (scene && world) return; // Only run once
        const localScene = new THREE.Scene();
        localScene.background = new THREE.Color(0x111827); // Darker background
        const localWorld = new CANNON.World();
        localWorld.gravity.set(0, 0, 0);
        localWorld.broadphase = new CANNON.NaiveBroadphase();
        localWorld.solver.iterations = 10;
        
        setScene(localScene);
        setWorld(localWorld);

        const initialNodes = createInitialNodes(localScene, localWorld, defaultSettings);
        setNodes(initialNodes);

        const initialEdges = createEdges(initialNodes, defaultSettings, localScene);
        setEdges(initialEdges);
    }, [scene, world]);

    const regenerateEdges = useCallback(() => {
        if (!scene) return;
        // Clear existing edges from scene
        edges.forEach(edge => scene.remove(edge.mesh));
        
        // Generate new edges
        const newEdges = createEdges(nodes, settings, scene);
        setEdges(newEdges);
    }, [scene, nodes, edges, settings]);
    
    const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

    const addNode = useCallback((data: { name: string, city: string, language: string, team: string }) => {
        if (!scene || !world) return;
        
        const properties = { city: data.city, language: data.language, team: data.team };

        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const initialPos = new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        mesh.position.copy(initialPos);
        const shape = new CANNON.Sphere(1);
        const physicsBody = new CANNON.Body({ mass: 1, linearDamping: settings.damping, angularDamping: settings.damping });
        physicsBody.addShape(shape);
        physicsBody.position.copy(initialPos as any);
        world.addBody(physicsBody);
        scene.add(mesh);

        const labelSprite = createLabelSprite(data.name);
        if (labelSprite) {
            labelSprite.position.set(initialPos.x, initialPos.y + 2, initialPos.z);
            scene.add(labelSprite);
        }

        const node: Node = { id: THREE.MathUtils.generateUUID(), name: data.name, mesh, properties, physicsBody, labelSprite };
        
        setNodes(prev => [...prev, node]);
        setSelectedNodeId(node.id);
        toast({ title: `Node "${data.name}" added successfully.` });
    }, [scene, world, settings.damping, toast]);

    const removeNode = useCallback(() => {
        if (!selectedNodeId || !scene || !world) return;
        setEdges(prev => prev.filter(e => {
            if (e.startNode.id === selectedNodeId || e.endNode.id === selectedNodeId) {
                e.mesh.geometry.dispose();
                (e.mesh.material as THREE.Material).dispose();
                scene.remove(e.mesh);
                return false;
            }
            return true;
        }));
        setNodes(prev => prev.filter(n => {
            if (n.id === selectedNodeId) {
                n.mesh.geometry.dispose();
                (n.mesh.material as THREE.Material).dispose();
                scene.remove(n.mesh);
                if (n.physicsBody) world.removeBody(n.physicsBody);
                if (n.labelSprite) {
                    (n.labelSprite.material as THREE.SpriteMaterial).map?.dispose();
                    (n.labelSprite.material as THREE.SpriteMaterial).dispose();
                    scene.remove(n.labelSprite);
                }
                return false;
            }
            return true;
        }));
        setSelectedNodeId(null);
    }, [selectedNodeId, scene, world]);

    const createEdge = useCallback((startNodeId: string, endNodeId: string) => {
        if (!scene) return;
        const startNode = nodes.find(n => n.id === startNodeId);
        const endNode = nodes.find(n => n.id === endNodeId);
        if (!startNode || !endNode || startNode === endNode || !startNode.mesh || !endNode.mesh || edges.some(e => e.startNode === startNode && e.endNode === endNode)) return;
        
        const material = new THREE.LineBasicMaterial({ color: 0x9ca3af, linewidth: 1, transparent: true, opacity: 0.7 });
        const geometry = new THREE.BufferGeometry().setFromPoints([startNode.mesh.position, endNode.mesh.position]);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        setEdges(prev => [...prev, { id: THREE.MathUtils.generateUUID(), startNode, endNode, mesh: line }]);
    }, [scene, nodes, edges]);

    const handleNodeClick = useCallback((nodeId: string | null) => {
        if (isConnecting) {
            if (!nodeId) { // Clicked on empty space, cancel connection
                 setIsConnecting(false);
                 setConnectionStartNodeId(null);
                 toast({ title: "Connection mode cancelled." });
                 return;
            }
            if (!connectionStartNodeId) {
                setConnectionStartNodeId(nodeId);
                toast({ title: "Select a target node to connect." });
            } else if (connectionStartNodeId !== nodeId) {
                createEdge(connectionStartNodeId, nodeId);
                setConnectionStartNodeId(null);
                setIsConnecting(false);
                toast({ title: "Connection created.", variant: "default" });
            }
        } else {
            setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
        }
    }, [isConnecting, connectionStartNodeId, createEdge, toast, selectedNodeId]);

    const toggleConnectionMode = useCallback(() => {
        const nextIsConnecting = !isConnecting;
        setIsConnecting(nextIsConnecting);

        if (nextIsConnecting) {
            setSelectedNodeId(null);
            setConnectionStartNodeId(null);
            toast({ title: "Connection mode enabled", description: "Select a start node." });
        } else {
            setConnectionStartNodeId(null);
            toast({ title: "Connection mode disabled" });
        }
    }, [isConnecting, toast]);

    const updateNodeProperty = useCallback((nodeId: string, prop: string, value: any) => {
        setNodes(nodes => {
            return nodes.map(n => {
                if (n.id === nodeId) {
                    if (prop === 'name') {
                        if (n.labelSprite) {
                            (n.labelSprite.material as THREE.SpriteMaterial).map?.dispose();
                             (n.labelSprite.material as THREE.SpriteMaterial).dispose();
                             scene?.remove(n.labelSprite);
                        }
                        const newLabelSprite = createLabelSprite(value);
                        if (newLabelSprite && scene) {
                            newLabelSprite.position.copy(n.mesh.position);
                            newLabelSprite.position.y += 2;
                            scene.add(newLabelSprite);
                        }
                        return { ...n, name: value, labelSprite: newLabelSprite };
                    }
                    return { ...n, properties: { ...n.properties, [prop]: value } };
                }
                return n;
            });
        });
    }, [scene]);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(s => {
            const updatedSettings = { ...s, ...newSettings };
            if(newSettings.damping) {
                nodes.forEach(n => {
                    if(n.physicsBody){
                        n.physicsBody.linearDamping = newSettings.damping!;
                        n.physicsBody.angularDamping = newSettings.damping!;
                    }
                });
            }
            if (newSettings.showNodeLabels !== undefined) {
                nodes.forEach(n => {
                    if(n.labelSprite) {
                        n.labelSprite.visible = newSettings.showNodeLabels!;
                    }
                })
            }
            return updatedSettings;
        });
    }, [nodes]);
    
    const propertyColorMap = useMemo(() => {
        const map: Record<string, Record<string, string>> = {};
        const allProperties = ['city', 'language', 'team'];

        allProperties.forEach(prop => {
            const uniqueValues = Array.from(new Set(nodes.map(n => n.properties[prop]).filter(v => v !== undefined)));
            if (uniqueValues.length > 0) {
                map[prop] = {};
                uniqueValues.forEach((value, index) => {
                    map[prop][value] = '#' + colorPalette[index % colorPalette.length].toString(16).padStart(6, '0');
                });
            }
        });
        
        return map;
    }, [nodes]);

    const clusterCenters = useMemo(() => {
        const centers: { [key: string]: CANNON.Vec3 } = {};
        if (clusterBy === 'none') return centers;

        const uniqueValues = Array.from(new Set(nodes.map(n => n.properties[clusterBy]).filter(Boolean)));
        const n = uniqueValues.length;

        uniqueValues.forEach((value, i) => {
            let centerVec;
            if (settings.clusterLayout === 'sphere' && n > 1) {
                const phi = Math.PI * (3. - Math.sqrt(5.));
                const y = 1 - (i / (n - 1)) * 2;
                const radiusAtY = Math.sqrt(1 - y * y);
                const theta = phi * i;
                const x = Math.cos(theta) * radiusAtY;
                const z = Math.sin(theta) * radiusAtY;
                centerVec = new CANNON.Vec3(x * settings.clusterRadius, y * settings.clusterRadius, z * settings.clusterRadius);
            } else {
                const angle = (i / n) * Math.PI * 2;
                const radius = n > 1 ? settings.clusterRadius : 0;
                centerVec = new CANNON.Vec3(radius * Math.cos(angle), radius * Math.sin(angle), 0);
            }
            centers[value] = centerVec;
        });
        return centers;
    }, [nodes, clusterBy, settings.clusterLayout, settings.clusterRadius]);

    return {
        nodes, setNodes,
        edges, setEdges,
        settings, updateSettings,
        selectedNode, setSelectedNodeId,
        isConnecting, setIsConnecting,
        connectionStartNodeId, setConnectionStartNodeId,
        physicsEnabled, setPhysicsEnabled,
        clusterBy, setClusterBy,
        colorBy, setColorBy,
        propertyColorMap,
        scene, setScene,
        world, setWorld,
        isAddNodeModalOpen, setAddNodeModalOpen,
        isPhysicsSettingsModalOpen, setPhysicsSettingsModalOpen,
        isGenerationSettingsModalOpen, setGenerationSettingsModalOpen,
        clusterCenters,
        addNode, removeNode, createEdge,
        handleNodeClick,
        toggleConnectionMode,
        updateNodeProperty,
        regenerateEdges,
    };
}
