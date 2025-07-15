
"use client";

import { Button } from './ui/button';
import { Plus, Trash2, Link, Play, Pause, Settings, FileJson, FileText, Text, BrainCircuit } from 'lucide-react';
import { downloadJSON, downloadCSV } from '@/lib/export';
import type { useGraphState } from '@/hooks/use-graph-state';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";

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

    const handleLabelToggle = () => {
        updateSettings({ showNodeLabels: !settings.showNodeLabels });
    }

    return (
        <div className="absolute top-4 right-4 z-10">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-card/80 backdrop-blur-sm">
                        <Settings />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Controls</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setAddNodeModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Add Node</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => removeNode()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Remove Node</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => toggleConnectionMode()}>
                            <Link className="mr-2 h-4 w-4" />
                            <span>{isConnecting ? 'Cancel Connection' : 'Connect Nodes'}</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />

                     <DropdownMenuGroup>
                        <DropdownMenuItem onClick={handleLabelToggle}>
                           <Text className="mr-2 h-4 w-4" />
                           <span>{settings.showNodeLabels ? 'Hide Labels' : 'Show Labels'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPhysicsEnabled(!physicsEnabled)}>
                            {physicsEnabled ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                            <span>{physicsEnabled ? 'Pause Physics' : 'Resume Physics'}</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setSettingsModalOpen(true)}>
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            <span>Physics Settings</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>


                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                         <DropdownMenuSubTrigger>
                            <FileJson className="mr-2 h-4 w-4" />
                            <span>Export</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                             <DropdownMenuItem onClick={() => downloadJSON(nodes, edges)}>
                                <FileJson className="mr-2 h-4 w-4" />
                                <span>Export as JSON</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadCSV(nodes, edges)}>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Export as CSV</span>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

// Keeping the old component commented out for reference, will be removed later.
/*
export function TopControls_Old({
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
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="default" onClick={() => setAddNodeModalOpen(true)} title="Add Node"><Plus className="mr-2"/> Add</Button>
                            <Button variant="outline" size="default" onClick={() => removeNode()} title="Remove Selected Node"><Trash2 className="mr-2"/> Remove</Button>
                            <Button variant={isConnecting ? "default" : "outline"} size="default" onClick={() => toggleConnectionMode()} title="Connect Nodes"><Link className="mr-2"/> Connect</Button>
                            <Button variant={settings.showNodeLabels ? "default" : "outline"} size="default" onClick={handleLabelToggle} title={settings.showNodeLabels ? "Hide Labels" : "Show Labels"}><Text className="mr-2"/> Labels</Button>
                        </div>
                    </div>
                     <div className="control-group">
                        <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Simulation</h4>
                         <div className="grid grid-cols-2 gap-2">
                             <Button variant="outline" size="default" onClick={() => setPhysicsEnabled(!physicsEnabled)} className={cn({'text-green-500 border-green-500 hover:text-green-600': physicsEnabled})} title={physicsEnabled ? "Pause Physics" : "Resume Physics"}>
                                {physicsEnabled ? <Pause /> : <Play />}
                            </Button>
                             <Button variant="outline" size="default" onClick={() => setSettingsModalOpen(true)} title="Settings"><Settings /></Button>
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
*/
