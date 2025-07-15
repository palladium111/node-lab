
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import type { Node, Edge, Settings } from '@/types';
import { sampleNodesData } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";

const defaultSettings: Settings = {
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

function createInitialNodes(scene: THREE.Scene, world: CANNON.World, settings: Settings): Node[] {
    return sampleNodesData.map(n => {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        const initialPos = new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        mesh.position.copy(initialPos);
        
        const shape = new CANNON.Sphere(1);
        const physicsBody = new CANNON.Body({ mass: 1, linearDamping: settings.damping, angularDamping: settings.damping });
        physicsBody.addShape(shape);
        physicsBody.position.copy(initialPos as any);
        
        world.addBody(physicsBody);
        scene.add(mesh);

        return { id: THREE.MathUtils.generateUUID(), name: n.name, mesh, properties: n.properties, physicsBody };
    });
}

function createEdges(nodes: Node[], settings: Settings, scene: THREE.Scene): Edge[] {
    let newEdges: Edge[] = [];
    if (nodes.length === 0 || !scene) return newEdges;

    let connectionCounts = new Map<string, number>();
    nodes.forEach(n => connectionCounts.set(n.id, 0));

    const createEdgeInternal = (nodeA: Node, nodeB: Node) => {
         if (!scene || !nodeA.mesh || !nodeB.mesh || nodeA === nodeB || newEdges.some(e => (e.startNode.id === nodeA.id && e.endNode.id === nodeB.id) || (e.startNode.id === nodeB.id && e.endNode.id === nodeA.id))) return;
        const material = new THREE.LineBasicMaterial({ color: 0x9ca3af, linewidth: 1, transparent: true, opacity: 0.7 });
        const geometry = new THREE.BufferGeometry().setFromPoints([nodeA.mesh.position, nodeB.mesh.position]);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        newEdges.push({ id: THREE.MathUtils.generateUUID(), startNode: nodeA, endNode: nodeB, mesh: line });
        connectionCounts.set(nodeA.id, (connectionCounts.get(nodeA.id) || 0) + 1);
        connectionCounts.set(nodeB.id, (connectionCounts.get(nodeB.id) || 0) + 1);
    }

    nodes.forEach(nodeA => {
        while ((connectionCounts.get(nodeA.id) || 0) < settings.minConnections) {
            const potentialTargets = nodes.filter(nodeB => 
                nodeA !== nodeB && 
                (connectionCounts.get(nodeB.id) || 0) < settings.maxConnections &&
                !newEdges.some(e => (e.startNode === nodeA && e.endNode === nodeB) || (e.startNode === nodeB && e.endNode === nodeA))
            );
            if (potentialTargets.length === 0) break;
            const targetNode = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
            createEdgeInternal(nodeA, targetNode);
        }
    });
    
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];
            if ((connectionCounts.get(nodeA.id) || 0) >= settings.maxConnections || (connectionCounts.get(nodeB.id) || 0) >= settings.maxConnections) continue;

            let probability = 0.05;
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
    const [clusterBy, setClusterBy] = useState('team');
    const [colorBy, setColorBy] = useState('city');
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    
    const [scene, setScene] = useState<THREE.Scene | null>(null);
    const [world, setWorld] = useState<CANNON.World | null>(null);

    // Initial setup
    useEffect(() => {
        if (!scene || !world || nodes.length > 0) return;

        const initialNodes = createInitialNodes(scene, world, settings);
        setNodes(initialNodes);

        const initialEdges = createEdges(initialNodes, settings, scene);
        setEdges(initialEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const addNode = useCallback(() => {
        if (!scene || !world) return;
        const name = 'New Person';
        const properties = { city: 'Undefined', language: 'Undefined', team: 'Undefined' };

        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        const initialPos = new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        mesh.position.copy(initialPos);
        const shape = new CANNON.Sphere(1);
        const physicsBody = new CANNON.Body({ mass: 1, linearDamping: settings.damping, angularDamping: settings.damping });
        physicsBody.addShape(shape);
        physicsBody.position.copy(initialPos as any);
        world.addBody(physicsBody);
        scene.add(mesh);

        const node: Node = { id: THREE.MathUtils.generateUUID(), name, mesh, properties, physicsBody };
        
        setNodes(prev => [...prev, node]);
        setSelectedNodeId(node.id);
        toast({ title: "New node added" });
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
                world.removeBody(n.physicsBody);
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
        if (!startNode || !endNode || startNode === endNode || edges.some(e => e.startNode === startNode && e.endNode === endNode)) return;
        
        const material = new THREE.LineBasicMaterial({ color: 0x9ca3af, linewidth: 1, transparent: true, opacity: 0.7 });
        const geometry = new THREE.BufferGeometry().setFromPoints([startNode.mesh.position, endNode.mesh.position]);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        setEdges(prev => [...prev, { id: THREE.MathUtils.generateUUID(), startNode, endNode, mesh: line }]);
    }, [scene, nodes, edges]);

    const handleNodeClick = useCallback((nodeId: string) => {
        if (isConnecting) {
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
        setIsConnecting(prev => {
            const next = !prev;
            if (next) {
                setSelectedNodeId(null);
                toast({ title: "Connection mode enabled", description: "Select a start node." });
            } else {
                setConnectionStartNodeId(null);
                toast({ title: "Connection mode disabled" });
            }
            return next;
        });
    }, [toast]);

    const updateNodeProperty = useCallback((nodeId: string, prop: string, value: any) => {
        setNodes(nodes => {
            return nodes.map(n => {
                if (n.id === nodeId) {
                    if (prop === 'name') return { ...n, name: value };
                    return { ...n, properties: { ...n.properties, [prop]: value } };
                }
                return n;
            });
        });
    }, []);

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

        const uniqueValues = Array.from(new Set(nodes.map(n => n.properties[clusterBy]).filter(v => v !== undefined)));
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
        isSettingsModalOpen, setSettingsModalOpen,
        clusterCenters,
        addNode, removeNode, createEdge,
        handleNodeClick,
        toggleConnectionMode,
        updateNodeProperty,
        regenerateEdges,
    };
}
