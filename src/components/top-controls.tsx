
"use client";

import { Button } from './ui/button';
import { Plus, Trash2, Link, Play, Pause, Settings, FileJson, FileText, Text, BrainCircuit, SlidersHorizontal, Share2 } from 'lucide-react';
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
    | 'setPhysicsSettingsModalOpen'
    | 'setGenerationSettingsModalOpen'
    | 'setAddNodeModalOpen'
    | 'settings'
    | 'updateSettings'
>;

export function TopControls({
    nodes, edges,
    removeNode, toggleConnectionMode, isConnecting,
    physicsEnabled, setPhysicsEnabled, setPhysicsSettingsModalOpen, setGenerationSettingsModalOpen, setAddNodeModalOpen,
    settings, updateSettings
}: TopControlsProps) {

    const handleLabelToggle = () => {
        updateSettings({ showNodeLabels: !settings.showNodeLabels });
    }

    return (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-card/80 backdrop-blur-sm">
                        <Share2 />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setAddNodeModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Add Node</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => removeNode()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Remove Selected Node</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => toggleConnectionMode()}>
                            <Link className="mr-2 h-4 w-4" />
                            <span>{isConnecting ? 'Cancel Connection' : 'Connect Nodes'}</span>
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

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-card/80 backdrop-blur-sm">
                        <Settings />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
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
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <BrainCircuit className="mr-2 h-4 w-4" />
                                <span>Advanced Settings</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                 <DropdownMenuItem onClick={() => setPhysicsSettingsModalOpen(true)}>
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    <span>Physics</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setGenerationSettingsModalOpen(true)}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    <span>Generation</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
