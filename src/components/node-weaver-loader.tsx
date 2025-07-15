"use client";

import dynamic from 'next/dynamic'

const NodeWeaverApp = dynamic(() => import('@/components/node-weaver-app').then(mod => mod.NodeWeaverApp), {
  ssr: false,
  loading: () => <div className="w-screen h-screen flex items-center justify-center bg-background"><p>Loading 3D Visualizer...</p></div>,
})

export default function Home() {
    return <NodeWeaverApp />;
}
