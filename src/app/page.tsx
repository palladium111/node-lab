
"use client";

import { NodeWeaverLoader } from "@/components/node-weaver-loader";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";

const NodeWeaverApp = dynamic(() => import('@/components/node-weaver-app').then(m => m.NodeWeaverApp), {
  ssr: false,
  loading: () => <NodeWeaverLoader />
});

export default function Home() {
  const { toast } = useToast();
  return (
    <main>
      <NodeWeaverApp />
    </main>
  );
}
