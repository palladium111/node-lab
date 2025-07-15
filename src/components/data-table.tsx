
"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { useGraphState } from '@/hooks/use-graph-state';

type DataTableProps = ReturnType<typeof useGraphState>;

export function DataTable({ nodes, edges, selectedNode, setSelectedNodeId, updateNodeProperty }: DataTableProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handlePropertyChange = (nodeId: string, prop: string, value: string) => {
        updateNodeProperty(nodeId, prop, value);
    };

    return (
        <div className={cn("absolute bottom-0 left-0 w-full z-10 transition-transform duration-300 ease-in-out", {
            'transform translate-y-[calc(100%-48px)]': isCollapsed
        })}>
            <div 
                className="h-12 bg-card/80 backdrop-blur-sm cursor-pointer flex items-center justify-center text-muted-foreground hover:bg-muted rounded-t-xl border-t border-b-0 border-border"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <span className="font-medium mr-2">Data Table</span>
                {isCollapsed ? <ChevronUp /> : <ChevronDown />}
            </div>
            <div className="h-[35vh] overflow-auto bg-card/80 backdrop-blur-sm">
                <Table>
                    <TableHeader className="sticky top-0 bg-card/90 z-10">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Connections</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {nodes.map(node => {
                             const connectionNames = edges.filter(e => e.startNode.id === node.id).map(e => e.endNode.name).join(', ');
                             return (
                                <TableRow
                                    key={node.id}
                                    className={cn("cursor-pointer", { 'bg-primary/20': selectedNode?.id === node.id })}
                                    onClick={(e) => {
                                        if (e.target instanceof HTMLElement && e.target.tagName !== 'INPUT') {
                                            setSelectedNodeId(node.id);
                                        }
                                    }}
                                >
                                    <TableCell className="py-1 px-4"><Input className="bg-transparent border-0 pl-0" value={node.name} onChange={e => handlePropertyChange(node.id, 'name', e.target.value)} /></TableCell>
                                    <TableCell className="py-1 px-4"><Input className="bg-transparent border-0 pl-0" value={node.properties.city || ''} onChange={e => handlePropertyChange(node.id, 'city', e.target.value)} /></TableCell>
                                    <TableCell className="py-1 px-4"><Input className="bg-transparent border-0 pl-0" value={node.properties.language || ''} onChange={e => handlePropertyChange(node.id, 'language', e.target.value)} /></TableCell>
                                    <TableCell className="py-1 px-4"><Input className="bg-transparent border-0 pl-0" value={node.properties.team || ''} onChange={e => handlePropertyChange(node.id, 'team', e.target.value)} /></TableCell>
                                    <TableCell className="py-1 px-4 text-muted-foreground">{connectionNames || 'None'}</TableCell>
                                </TableRow>
                             )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
