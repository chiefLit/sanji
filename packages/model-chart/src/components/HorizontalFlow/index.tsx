import React, { useCallback } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

import './index.css';

const initialNodes = [
  { id: '0', type: 'custominput', position: { x: 0, y: 150 } },
  { id: 'A', type: 'customnode', position: { x: 250, y: 0 } },
  { id: 'B', type: 'customnode', position: { x: 250, y: 150 } },
  { id: 'C', type: 'customnode', position: { x: 250, y: 300 } },
];

const isValidConnection = (connection) => true;
const onConnectStart = (_, { nodeId, handleType }) => console.log('on connect start', { nodeId, handleType });
const onConnectEnd = (event) => console.log('on connect end', event);

const CustomInput = () => (
  <>
    <div>Only connectable with B</div>
    <Handle type="source" position={Position.Right} isValidConnection={isValidConnection} />
  </>
);

const CustomNode = ({ id }) => (
  <>
    <Handle type="target" position={Position.Left} isValidConnection={isValidConnection} />
    <div>{id}</div>
    <Handle type="source" position={Position.Right} isValidConnection={isValidConnection} />
  </>
);

const nodeTypes = {
  custominput: CustomInput,
  customnode: CustomNode,
};

const HorizontalFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      selectNodesOnDrag={false}
      className="validationflow"
      nodeTypes={nodeTypes}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      fitView
      attributionPosition="bottom-left"
    />
  );
};

export { HorizontalFlow };
