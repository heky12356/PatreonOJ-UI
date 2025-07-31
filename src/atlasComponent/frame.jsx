import React, { useEffect, useState } from 'react';
import ForceDirectedGraph from './grouph';

export default function Frame() {
    const graphData = {
        nodes: [
            { id: "Node 1", group: 1 },
            { id: "Node 2", group: 2 },
            { id: "Node 3", group: 1 },
            { id: "Node 4", group: 1 },
            { id: "Node 5", group: 1 },
            { id: "Node 6", group: 2 },
            { id: "Node 7", group: 1 },
            { id: "Node 8", group: 1 },
            { id: "Node 9", group: 1 },
            { id: "Node 10", group: 2 },
            { id: "Node 11", group: 1 },
            { id: "Node 12", group: 1 },
            { id: "Node 13", group: 1 },
            { id: "Node 14", group: 1 },
            { id: "Node 15", group: 1 },
        ],
        links: [
            { source: "Node 1", target: "Node 2", value: 2 },
            { source: "Node 2", target: "Node 3", value: 2 },
            { source: "Node 2", target: "Node 4", value: 2 },
            { source: "Node 2", target: "Node 5", value: 2 },
            { source: "Node 2", target: "Node 6", value: 2 },
            { source: "Node 6", target: "Node 7", value: 2 },
            { source: "Node 6", target: "Node 8", value: 2 },
            { source: "Node 6", target: "Node 9", value: 2 },
            { source: "Node 6", target: "Node 10", value: 2 },
            { source: "Node 10", target: "Node 11", value: 2 },
            { source: "Node 10", target: "Node 12", value: 2 },
            { source: "Node 10", target: "Node 13", value: 2 },
            { source: "Node 10", target: "Node 14", value: 2 },
            { source: "Node 10", target: "Node 15", value: 2 },
        ]
    };

    const [highlightedNodes, setHighlightedNodes] = useState([]);

    // 模拟后端传入高亮节点
    useEffect(() => {
        // 这里可以是API调用
        setTimeout(() => {
            setHighlightedNodes(["Node 2", "Node 6", "Node 10"]); // 示例高亮节点
        }, 2000);
    }, []);

    return (
        <div>
            <ForceDirectedGraph
                data={graphData}
                highlightedNodes={highlightedNodes}
            />
        </div>
    )
}