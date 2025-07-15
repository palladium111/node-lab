"use client";

import { useGraphState } from '@/hooks/use-graph-state';
import { GraphVisualization } from './graph-visualization';
import { TopControls } from './top-controls';
import { PropertiesPanel } from './properties-panel';
import { DataTable } from './data-table';
import { SettingsModal } from './settings-modal';

export function NodeWeaverApp() {
    const graphState = useGraphState();

    return (
        <div className="w-screen h-screen relative">
            <TopControls {...graphState} />

            <GraphVisualization {...graphState} />

            <PropertiesPanel {...graphState} />

            <DataTable {...graphState} />

            <SettingsModal {...graphState} />
        </div>
    );
}
