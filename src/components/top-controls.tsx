
"use client";

import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Plus, Trash2, Link, Play, Pause, Settings, FileJson, FileText, Text, BrainCircuit, SlidersHorizontal, Menu, RefreshCw } from 'lucide-react';
import { downloadJSON, downloadCSV } from '@/lib/export';
import type { useGraphState } from '@/hooks/use-graph-state';
import type { Settings as ISettings } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
    displayTransform: (value: string | number) => string,
}) => (
    <div className="w-full space-y-2 px-2">
        <div className="flex justify-between items-center">
            <Label htmlFor={id} className="text-xs">{label}</Label>
            <span className="text-xs text-muted-foreground">{displayTransform(value)}</span>
        </div>
        <Slider id={id} value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onValueChange(v)} />
    </div>
);

const RadioGroupControl = ({ value, onValueChange }: {
    value: 'circle' | 'sphere',
    onValueChange: (value: any) => void,
}) => (
     <div className="w-full px-2 space-y-2">
        <Label className="text-xs">Cluster Layout</Label>
        <RadioGroup value={value} onValueChange={(v) => onValueChange({ clusterLayout: v as 'circle' | 'sphere' })} className="flex gap-4">
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
    
    const handleSettingsChange = (newSettings: Partial<ISettings>) => {
        updateSettings(newSettings);
    };

    return (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" className="bg-card/80 backdrop-blur-sm border text-foreground hover:bg-accent hover:text-accent-foreground">
                        <Menu />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card/80 backdrop-blur-sm" align="end">
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
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Export</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => downloadJSON(nodes, edges)}>
                            <FileJson className="mr-2 h-4 w-4" />
                            <span>Export as JSON</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadCSV(nodes, edges)}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Export as CSV</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" className="bg-card/80 backdrop-blur-sm border text-foreground hover:bg-accent hover:text-accent-foreground">
                        <Settings />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-card/80 backdrop-blur-sm" align="end">
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
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator/>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Physics</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <SliderControl label="Cluster Attraction" id="attraction" value={settings.clusterAttraction} min={0} max={3} step={0.1} onValueChange={(v) => handleSettingsChange({ clusterAttraction: v })} displayTransform={(v) => (v as number).toFixed(2)} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <SliderControl label="Node Repulsion" id="repulsion" value={settings.repulsionStrength} min={0} max={50} step={1} onValueChange={(v) => handleSettingsChange({ repulsionStrength: v })} displayTransform={(v) => (v as number).toFixed(2)} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <SliderControl label="Connection Length" id="conn-length" value={settings.connectionLength} min={1} max={20} step={1} onValueChange={(v) => handleSettingsChange({ connectionLength: v })} displayTransform={(v) => (v as number).toFixed(2)} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <SliderControl label="Connection Stiffness" id="conn-stiffness" value={settings.connectionStiffness} min={1} max={100} step={1} onValueChange={(v) => handleSettingsChange({ connectionStiffness: v })} displayTransform={(v) => (v as number).toFixed(2)} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <SliderControl label="Damping (Friction)" id="damping" value={settings.damping} min={0.5} max={0.99} step={0.01} onValueChange={(v) => handleSettingsChange({ damping: v })} displayTransform={(v) => (v as number).toFixed(2)} />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator/>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Generation</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <RadioGroupControl value={settings.clusterLayout} onValueChange={handleSettingsChange} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <SliderControl label="Min Connections / Node" id="min-conn" value={settings.minConnections} min={0} max={10} step={1} onValueChange={(v) => handleSettingsChange({ minConnections: v })} displayTransform={(v) => v} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <SliderControl label="Max Connections / Node" id="max-conn" value={settings.maxConnections} min={0} max={10} step={1} onValueChange={(v) => handleSettingsChange({ maxConnections: v })} displayTransform={(v) => v} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <SliderControl label="City Connection Affinity" id="city-affinity" value={settings.cityAffinity * 100} min={0} max={100} step={1} onValueChange={(v) => handleSettingsChange({ cityAffinity: v / 100 })} displayTransform={(v) => `${(v as number).toFixed(0)}%`} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <SliderControl label="Language Connection Affinity" id="lang-affinity" value={settings.languageAffinity * 100} min={0} max={100} step={1} onValueChange={(v) => handleSettingsChange({ languageAffinity: v / 100 })} displayTransform={(v) => `${(v as number).toFixed(0)}%`} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <SliderControl label="Cluster Spacing" id="spacing" value={settings.clusterRadius} min={5} max={50} step={1} onValueChange={(v) => handleSettingsChange({ clusterRadius: v })} displayTransform={(v) => (v as number).toFixed(2)} />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleRegenerate}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Regenerate Edges</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
