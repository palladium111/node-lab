
"use client";

import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Plus, Trash2, Link, Play, Pause, Settings, FileJson, FileText, Text, BrainCircuit, SlidersHorizontal, Share2, RefreshCw } from 'lucide-react';
import { downloadJSON, downloadCSV } from '@/lib/export';
import type { useGraphState } from '@/hooks/use-graph-state';
import type { Settings } from '@/types';
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
    | 'setAddNodeModalOpen'
    | 'settings'
    | 'updateSettings'
    | 'regenerateEdges'
>;

const SliderControl = ({ label, value, id, min, max, step, onValueChange, displayTransform }: {
    label: string,
    value: number,
    id: string,
    min: number,
    max: number,
    step: number,
    onValueChange: (value: number) => void,
    displayTransform: (value: number) => string,
}) => (
    <div className="space-y-2 px-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
            <Label htmlFor={id} className="text-xs">{label}</Label>
            <span className="text-xs text-muted-foreground">{displayTransform(value)}</span>
        </div>
        <Slider id={id} value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onValueChange(v)} />
    </div>
);

export function TopControls({
    nodes, edges,
    removeNode, toggleConnectionMode, isConnecting,
    physicsEnabled, setPhysicsEnabled, setAddNodeModalOpen,
    settings, updateSettings, regenerateEdges
}: TopControlsProps) {

    const handleLabelToggle = () => {
        updateSettings({ showNodeLabels: !settings.showNodeLabels });
    }

    const handleRegenerate = () => {
        regenerateEdges();
    }
    
    const handleSettingsChange = (newSettings: Partial<Settings>) => {
        updateSettings(newSettings);
    };

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
                <DropdownMenuContent className="w-64" align="end">
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
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                <span>Physics</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-64 p-2 space-y-4">
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <SliderControl label="Cluster Attraction" id="attraction" value={settings.clusterAttraction} min={0} max={3} step={0.1} onValueChange={(v:any) => handleSettingsChange({ clusterAttraction: v })} displayTransform={(v:any) => v.toFixed(2)} />
                                </DropdownMenuItem>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <SliderControl label="Node Repulsion" id="repulsion" value={settings.repulsionStrength} min={0} max={50} step={1} onValueChange={(v:any) => handleSettingsChange({ repulsionStrength: v })} displayTransform={(v:any) => v.toFixed(2)} />
                                </DropdownMenuItem>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <SliderControl label="Connection Length" id="conn-length" value={settings.connectionLength} min={1} max={20} step={1} onValueChange={(v:any) => handleSettingsChange({ connectionLength: v })} displayTransform={(v:any) => v.toFixed(2)} />
                                </DropdownMenuItem>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <SliderControl label="Connection Stiffness" id="conn-stiffness" value={settings.connectionStiffness} min={1} max={100} step={1} onValueChange={(v:any) => handleSettingsChange({ connectionStiffness: v })} displayTransform={(v:any) => v.toFixed(2)} />
                                </DropdownMenuItem>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <SliderControl label="Damping (Friction)" id="damping" value={settings.damping} min={0.5} max={0.99} step={0.01} onValueChange={(v:any) => handleSettingsChange({ damping: v })} displayTransform={(v:any) => v.toFixed(2)} />
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <BrainCircuit className="mr-2 h-4 w-4" />
                                <span>Generation</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-64 p-2 space-y-4">
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <div className="px-2 w-full space-y-2">
                                        <Label className="text-xs">Cluster Layout</Label>
                                        <RadioGroup value={settings.clusterLayout} onValueChange={(v) => handleSettingsChange({ clusterLayout: v as 'circle' | 'sphere' })} className="flex gap-4">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="circle" id="circle" />
                                                <Label htmlFor="circle" className="text-xs font-normal">Circle</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="sphere" id="sphere" />
                                                <Label htmlFor="sphere" className="text-xs font-normal">Sphere</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </DropdownMenuItem>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <SliderControl label="Min Connections / Node" id="min-conn" value={settings.minConnections} min={0} max={10} step={1} onValueChange={(v:any) => handleSettingsChange({ minConnections: v })} displayTransform={(v:any) => v} />
                                </DropdownMenuItem>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <SliderControl label="Max Connections / Node" id="max-conn" value={settings.maxConnections} min={0} max={10} step={1} onValueChange={(v:any) => handleSettingsChange({ maxConnections: v })} displayTransform={(v:any) => v} />
                                </DropdownMenuItem>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <SliderControl label="City Connection Affinity" id="city-affinity" value={settings.cityAffinity * 100} min={0} max={100} step={1} onValueChange={(v:any) => handleSettingsChange({ cityAffinity: v / 100 })} displayTransform={(v:any) => `${v.toFixed(0)}%`} />
                                </DropdownMenuItem>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <SliderControl label="Language Connection Affinity" id="lang-affinity" value={settings.languageAffinity * 100} min={0} max={100} step={1} onValueChange={(v:any) => handleSettingsChange({ languageAffinity: v / 100 })} displayTransform={(v:any) => `${v.toFixed(0)}%`} />
                                </DropdownMenuItem>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <SliderControl label="Cluster Spacing" id="spacing" value={settings.clusterRadius} min={5} max={50} step={1} onValueChange={(v:any) => handleSettingsChange({ clusterRadius: v })} displayTransform={(v:any) => v.toFixed(2)} />
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                               <DropdownMenuItem onClick={handleRegenerate}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    <span>Regenerate Edges</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
