
"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronUp, ChevronDown, Plus, Trash2, Link, Play, Pause, Settings, FileJson, FileText, Text } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadJSON, downloadCSV } from '@/lib/export';
import type { useGraphState } from '@/hooks/use-graph-state';
import type { Settings } from '@/types';

type TopControlsProps = ReturnType<typeof useGraphState>;

const allProperties = ['city', 'language', 'team'];

export function TopControls({
    nodes, edges, clusterBy, setClusterBy, colorBy, setColorBy, propertyColorMap,
    removeNode, toggleConnectionMode, isConnecting,
    physicsEnabled, setPhysicsEnabled, setSettingsModalOpen, setAddNodeModalOpen,
    settings, updateSettings
}: TopControlsProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLabelToggle = () => {
        updateSettings({ showNodeLabels: !settings.showNodeLabels });
    }

    return (
        <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-10 transition-transform duration-300 ease-in-out", {
            'transform -translate-y-[calc(100%-48px)] -translate-x-1/2': isCollapsed
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
                            <Button variant="outline" size="default" onClick={() => setAddNodeModalOpen(true)}><Plus /></Button>
                            <Button variant="outline" size="default" onClick={() => removeNode()}><Trash2 /></Button>
                            <Button variant={isConnecting ? "default" : "outline"} size="default" onClick={() => toggleConnectionMode()}><Link /></Button>
                            <Button variant="outline" size="default" onClick={() => setPhysicsEnabled(!physicsEnabled)} className={cn({'text-green-500 border-green-500 hover:text-green-600': physicsEnabled})}>
                                {physicsEnabled ? <Pause /> : <Play />}
                            </Button>
                            <Button variant="outline" size="default" onClick={() => setSettingsModalOpen(true)}><Settings /></Button>
                            <Button variant={settings.showNodeLabels ? "default" : "outline"} size="default" onClick={handleLabelToggle}><Text /></Button>
                        </div>
                    </div>
                    <div className="control-group">
                        <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Export</h4>
                        <div className="grid grid-cols-2 gap-2">
                             <Button variant="outline" size="default" onClick={() => downloadJSON(nodes, edges)}><FileJson /> JSON</Button>
                             <Button variant="outline" size="default" onClick={() => downloadCSV(nodes, edges)}><FileText /> CSV</Button>
                        </div>
                    </div>
                </div>
                <div 
                    className="h-12 bg-card/50 cursor-pointer flex items-center justify-center text-muted-foreground hover:bg-muted rounded-b-xl"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <span className="font-medium mr-2">Controls</span>
                    {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
            </div>
        </div>
    );
}
