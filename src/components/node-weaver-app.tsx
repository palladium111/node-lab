
"use client";

import { useGraphState } from '@/hooks/use-graph-state';
import { GraphVisualization } from './graph-visualization';
import { TopControls } from './top-controls';
import { PropertiesPanel } from './properties-panel';
import { DataTable } from './data-table';
import { AddNodeModal } from './add-node-modal';
import { LeftControls } from './left-controls';

export function NodeWeaverApp() {
    const graphState = useGraphState();

    return (
        <div className="w-screen h-screen relative">
            <LeftControls {...graphState} />
            <TopControls {...graphState} />

            <GraphVisualization {...graphState} />

            <PropertiesPanel {...graphState} />

            <DataTable {...graphState} />

            <AddNodeModal
                isOpen={graphState.isAddNodeModalOpen}
                onOpenChange={graphState.setAddNodeModalOpen}
                addNode={graphState.addNode}
            />
        </div>
    );
}
