"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronUp, ChevronDown, Plus, Trash2, Link, Play, Pause, Settings, FileJson, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadJSON, downloadCSV } from '@/lib/export';
import type { useGraphState } from '@/hooks/use-graph-state';

type TopControlsProps = ReturnType<typeof useGraphState>;

const allProperties = ['city', 'language', 'team'];

export function TopControls({
    nodes, edges, clusterBy, setClusterBy, colorBy, setColorBy, propertyColorMap,
    addNode, removeNode, toggleConnectionMode, isConnecting,
    physicsEnabled, setPhysicsEnabled, setSettingsModalOpen
}: TopControlsProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-10 transition-transform duration-300 ease-in-out", {
            'transform -translate-y-[calc(100%-40px)] -translate-x-1/2': isCollapsed
        })}>
            <div className="bg-card/80 backdrop-blur-sm shadow-lg rounded-b-xl">
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="control-group">
                        <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Cluster by</h4>
                        <Select value={clusterBy} onValueChange={setClusterBy}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {allProperties.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="control-group">
                        <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Color by</h4>
                        <Select value={colorBy} onValueChange={setColorBy}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Default</SelectItem>
                                {allProperties.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
                            {colorBy !== 'none' && Object.entries(propertyColorMap[colorBy] || {}).map(([value, color]) => (
                                <div key={value} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
                                    <span className="text-sm text-muted-foreground">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="control-group">
                        <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Actions</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" size="sm" onClick={() => addNode()}><Plus /> Add</Button>
                            <Button variant="outline" size="sm" onClick={() => removeNode()}><Trash2 /> Remove</Button>
                            <Button variant={isConnecting ? "default" : "outline"} size="sm" onClick={() => toggleConnectionMode()}><Link /> Connect</Button>
                            <Button variant="outline" size="sm" onClick={() => setPhysicsEnabled(!physicsEnabled)} className={cn({'text-green-500 border-green-500 hover:text-green-600': physicsEnabled})}>
                                {physicsEnabled ? <Pause /> : <Play />}
                                Physics
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSettingsModalOpen(true)}><Settings /> Settings</Button>
                        </div>
                    </div>
                    <div className="control-group">
                        <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Export</h4>
                        <div className="grid grid-cols-2 gap-2">
                             <Button variant="outline" size="sm" onClick={() => downloadJSON(nodes, edges)}><FileJson /> JSON</Button>
                             <Button variant="outline" size="sm" onClick={() => downloadCSV(nodes, edges)}><FileText /> CSV</Button>
                        </div>
                    </div>
                </div>
                <div 
                    className="h-10 bg-card/50 cursor-pointer flex items-center justify-center text-muted-foreground hover:bg-muted rounded-b-xl"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
            </div>
        </div>
    );
}
