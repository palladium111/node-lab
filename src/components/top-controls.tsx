
"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronUp, ChevronDown, Plus, Trash2, Link, Play, Pause, Settings, FileJson, FileText, Text } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadJSON, downloadCSV } from '@/lib/export';
import type { useGraphState } from '@/hooks/use-graph-state';

type TopControlsProps = Pick<
    ReturnType<typeof useGraphState>,
    | 'nodes'
    | 'edges'
    | 'removeNode'
    | 'toggleConnectionMode'
    | 'isConnecting'
    | 'physicsEnabled'
    | 'setPhysicsEnabled'
    | 'setSettingsModalOpen'
    | 'setAddNodeModalOpen'
    | 'settings'
    | 'updateSettings'
>;

export function TopControls({
    nodes, edges,
    removeNode, toggleConnectionMode, isConnecting,
    physicsEnabled, setPhysicsEnabled, setSettingsModalOpen, setAddNodeModalOpen,
    settings, updateSettings
}: TopControlsProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleLabelToggle = () => {
        updateSettings({ showNodeLabels: !settings.showNodeLabels });
    }

    return (
        <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-10 transition-transform duration-300 ease-in-out", {
            'transform -translate-y-[calc(100%-48px)] -translate-x-1/2': isCollapsed
        })}>
            <div className="bg-card/80 backdrop-blur-sm shadow-lg rounded-b-xl">
                 <div 
                    className="h-12 bg-card/50 cursor-pointer flex items-center justify-center text-muted-foreground hover:bg-muted rounded-b-xl"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <span className="font-medium mr-2">Controls</span>
                    {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="control-group">
                        <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Actions</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" size="default" onClick={() => setAddNodeModalOpen(true)} title="Add Node"><Plus /></Button>
                            <Button variant="outline" size="default" onClick={() => removeNode()} title="Remove Selected Node"><Trash2 /></Button>
                            <Button variant={isConnecting ? "default" : "outline"} size="default" onClick={() => toggleConnectionMode()} title="Connect Nodes"><Link /></Button>
                            <Button variant="outline" size="default" onClick={() => setPhysicsEnabled(!physicsEnabled)} className={cn({'text-green-500 border-green-500 hover:text-green-600': physicsEnabled})} title={physicsEnabled ? "Pause Physics" : "Resume Physics"}>
                                {physicsEnabled ? <Pause /> : <Play />}
                            </Button>
                            <Button variant="outline" size="default" onClick={() => setSettingsModalOpen(true)} title="Settings"><Settings /></Button>
                            <Button variant={settings.showNodeLabels ? "default" : "outline"} size="default" onClick={handleLabelToggle} title={settings.showNodeLabels ? "Hide Labels" : "Show Labels"}><Text /></Button>
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
            </div>
        </div>
    );
}
