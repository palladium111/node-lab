import type { Node, Edge } from '@/types';

function triggerDownload(filename: string, content: string, mimeType: string) {
    const a = document.createElement('a');
    const blob = new Blob([content], { type: mimeType });
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

export function downloadJSON(nodes: Node[], edges: Edge[]) {
    const data = {
        nodes: nodes.map(n => ({ id: n.id, name: n.name, properties: n.properties })),
        edges: edges.map(e => ({ source: e.startNode.id, target: e.endNode.id }))
    };
    triggerDownload('graph-data.json', JSON.stringify(data, null, 2), 'application/json');
}

export function downloadCSV(nodes: Node[], edges: Edge[]) {
    const allProperties = ['city', 'language', 'team'];
    let csvContent = "id,name," + allProperties.join(',') + ",connections\n";
    nodes.forEach(node => {
        const row = [
            node.id,
            `"${node.name.replace(/"/g, '""')}"`,
            ...allProperties.map(prop => `"${(node.properties[prop] || '').toString().replace(/"/g, '""')}"`),
            `"${edges.filter(e => e.startNode.id === node.id).map(e => e.endNode.name).join(';').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + "\n";
    });
    triggerDownload('graph-data.csv', csvContent, 'text/csv;charset=utf-8;');
}
