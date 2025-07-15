
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import type { useGraphState } from '@/hooks/use-graph-state';
import type { Settings } from '@/types';

type SettingsModalProps = ReturnType<typeof useGraphState>;

const SliderControl = ({ label, value, id, min, max, step, onValueChange, displayTransform }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <Label htmlFor={id}>{label}</Label>
            <span className="text-sm text-muted-foreground">{displayTransform(value)}</span>
        </div>
        <Slider id={id} value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onValueChange(v)} />
    </div>
);

export function SettingsModal({ settings, updateSettings, isSettingsModalOpen, setSettingsModalOpen, regenerateEdges }: SettingsModalProps) {
    const handleSettingsChange = (newSettings: Partial<Settings>) => {
        updateSettings(newSettings);
    };

    const handleRegenerate = () => {
        regenerateEdges();
        setSettingsModalOpen(false);
    }

    return (
        <Dialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Physics & Generation Settings</DialogTitle>
                    <DialogDescription>Adjust graph generation and physics parameters. Some changes require regenerating edges.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                     <div className="space-y-2">
                        <Label>Cluster Layout</Label>
                        <RadioGroup value={settings.clusterLayout} onValueChange={(v) => handleSettingsChange({ clusterLayout: v as 'circle' | 'sphere' })} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="circle" id="circle" />
                                <Label htmlFor="circle">Circle</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sphere" id="sphere" />
                                <Label htmlFor="sphere">Sphere</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <h4 className="text-sm font-medium text-muted-foreground border-t pt-4">Connection Generation</h4>
                    <SliderControl label="Min Connections / Node" id="min-conn" value={settings.minConnections} min={0} max={10} step={1} onValueChange={(v:any) => handleSettingsChange({ minConnections: v })} displayTransform={(v:any) => v} />
                    <SliderControl label="Max Connections / Node" id="max-conn" value={settings.maxConnections} min={0} max={10} step={1} onValueChange={(v:any) => handleSettingsChange({ maxConnections: v })} displayTransform={(v:any) => v} />
                    <SliderControl label="City Connection Affinity" id="city-affinity" value={settings.cityAffinity * 100} min={0} max={100} step={1} onValueChange={(v:any) => handleSettingsChange({ cityAffinity: v / 100 })} displayTransform={(v:any) => `${v.toFixed(0)}%`} />
                    <SliderControl label="Language Connection Affinity" id="lang-affinity" value={settings.languageAffinity * 100} min={0} max={100} step={1} onValueChange={(v:any) => handleSettingsChange({ languageAffinity: v / 100 })} displayTransform={(v:any) => `${v.toFixed(0)}%`} />
                     <Button onClick={handleRegenerate}>Regenerate Edges</Button>

                    <h4 className="text-sm font-medium text-muted-foreground border-t pt-4">Physics</h4>
                    <SliderControl label="Cluster Attraction" id="attraction" value={settings.clusterAttraction} min={0} max={3} step={0.1} onValueChange={(v:any) => handleSettingsChange({ clusterAttraction: v })} displayTransform={(v:any) => v.toFixed(2)} />
                    <SliderControl label="Node Repulsion" id="repulsion" value={settings.repulsionStrength} min={0} max={50} step={1} onValueChange={(v:any) => handleSettingsChange({ repulsionStrength: v })} displayTransform={(v:any) => v.toFixed(2)} />
                    <SliderControl label="Connection Length" id="conn-length" value={settings.connectionLength} min={1} max={20} step={1} onValueChange={(v:any) => handleSettingsChange({ connectionLength: v })} displayTransform={(v:any) => v.toFixed(2)} />
                    <SliderControl label="Connection Stiffness" id="conn-stiffness" value={settings.connectionStiffness} min={1} max={100} step={1} onValueChange={(v:any) => handleSettingsChange({ connectionStiffness: v })} displayTransform={(v:any) => v.toFixed(2)} />
                    <SliderControl label="Cluster Spacing" id="spacing" value={settings.clusterRadius} min={5} max={50} step={1} onValueChange={(v:any) => handleSettingsChange({ clusterRadius: v })} displayTransform={(v:any) => v.toFixed(2)} />
                    <SliderControl label="Damping (Friction)" id="damping" value={settings.damping} min={0.5} max={0.99} step={0.01} onValueChange={(v:any) => handleSettingsChange({ damping: v })} displayTransform={(v:any) => v.toFixed(2)} />

                </div>
            </DialogContent>
        </Dialog>
    );
}
