"use client";

import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import type { useGraphState } from '@/hooks/use-graph-state';

type PropertiesPanelProps = ReturnType<typeof useGraphState>;

export function PropertiesPanel({ selectedNode, updateNodeProperty, edges }: PropertiesPanelProps) {
    if (!selectedNode) return null;

    const outgoingConnectionNames = edges.filter(e => e.startNode.id === selectedNode.id).map(e => e.endNode.name).join(', ');
    const incomingConnectionNames = edges.filter(e => e.endNode.id === selectedNode.id).map(e => e.startNode.name).join(', ');

    const handlePropertyChange = (prop: string, value: string) => {
        updateNodeProperty(selectedNode.id, prop, value);
    };

    return (
        <div className={cn("absolute top-1/2 right-5 transform -translate-y-1/2 z-10 w-72", {
            'hidden': !selectedNode,
        })}>
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Node Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    <div className="property space-y-2">
                        <Label htmlFor="node-name">Name</Label>
                        <Input id="node-name" value={selectedNode.name} onChange={e => handlePropertyChange('name', e.target.value)} />
                    </div>
                    <div className="property space-y-2">
                        <Label htmlFor="node-city">City</Label>
                        <Input id="node-city" value={selectedNode.properties.city || ''} onChange={e => handlePropertyChange('city', e.target.value)} />
                    </div>
                    <div className="property space-y-2">
                        <Label htmlFor="node-language">Language</Label>
                        <Input id="node-language" value={selectedNode.properties.language || ''} onChange={e => handlePropertyChange('language', e.target.value)} />
                    </div>
                    <div className="property space-y-2">
                        <Label htmlFor="node-team">Team</Label>
                        <Input id="node-team" value={selectedNode.properties.team || ''} onChange={e => handlePropertyChange('team', e.target.value)} />
                    </div>
                     <div className="property space-y-2">
                        <Label>Outgoing Connections</Label>
                        <div className="p-2 rounded-md bg-muted text-sm min-h-[2.5rem] text-muted-foreground">{outgoingConnectionNames || 'None'}</div>
                    </div>
                     <div className="property space-y-2">
                        <Label>Incoming Connections</Label>
                        <div className="p-2 rounded-md bg-muted text-sm min-h-[2.5rem] text-muted-foreground">{incomingConnectionNames || 'None'}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
