
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { useGraphState } from '@/hooks/use-graph-state';

type LeftControlsProps = Pick<
  ReturnType<typeof useGraphState>,
  'clusterBy' | 'setClusterBy' | 'colorBy' | 'setColorBy' | 'propertyColorMap' | 'updatePropertyColor'
>;

const allProperties = ['city', 'language', 'team'];

export function LeftControls({
  clusterBy,
  setClusterBy,
  colorBy,
  setColorBy,
  propertyColorMap,
  updatePropertyColor,
}: LeftControlsProps) {
  return (
    <div className="absolute top-4 left-4 z-10 w-64 space-y-4">
      <div className="p-4 bg-card/80 backdrop-blur-sm shadow-lg rounded-xl space-y-4">
        <div className="control-group">
          <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">
            Cluster by
          </h4>
          <Select value={clusterBy} onValueChange={setClusterBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {allProperties.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="control-group">
          <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">
            Color by
          </h4>
          <Select value={colorBy} onValueChange={setColorBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Default</SelectItem>
              {allProperties.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-2 space-y-2">
            {colorBy !== 'none' &&
              Object.entries(propertyColorMap[colorBy] || {}).map(
                ([value, color]) => (
                  <div key={value} className="flex items-center gap-2">
                    <div className="color-picker-wrapper" style={{ backgroundColor: color as string }}>
                        <input type="color" value={color as string} onChange={(e) => updatePropertyColor(colorBy, value, e.target.value)} />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {value}
                    </span>
                  </div>
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
