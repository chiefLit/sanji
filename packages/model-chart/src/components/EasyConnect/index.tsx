import React, { useCallback } from 'react';

import ReactFlow, { addEdge, useNodesState, useEdgesState, MarkerType, EdgeTypes, Node, Edge, OnConnect, MiniMap, OnEdgesChange, OnEdgeUpdateFunc, NodeMouseHandler } from 'reactflow';

import CustomNode from './CustomNode';
import FloatingEdge from './FloatingEdge';
import CustomConnectionLine from './CustomConnectionLine';

import 'reactflow/dist/style.css';
import './style.css';

const initialNodes: Node[] = [
  { id: '1', type: 'custom', position: { x: 0, y: 0 }, data: {} },
  { id: '2', type: 'custom', position: { x: 250, y: 320 }, data: {} },
  { id: '3', type: 'custom', position: { x: 40, y: 300 }, data: {} },
  { id: '4', type: 'custom', position: { x: 300, y: 0 }, data: {} },
];

const initialEdges: Edge[] = [];

const connectionLineStyle = {
  strokeWidth: 1,
  stroke: 'black',
};

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
  floating: FloatingEdge,
};

const defaultEdgeOptions = {
  style: { strokeWidth: 1, stroke: 'black' },
  type: 'floating',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'black',
  },
};

const EasyConnectExample = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onAddClick = () => {
    setNodes((nodes) => {

      return [...nodes, { id: '5', type: 'custom', position: { x: 300, y: 0 }, data: {} }]
    })
  }

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    console.log('%cindex.tsx line:50 edge', 'color: #007acc;', edge);
  }

  const onNodeClick: NodeMouseHandler = (event: React.MouseEvent, node: Node) => {
    console.log('%cindex.tsx line:54 node', 'color: #007acc;', node);
  }

  const onConnect: OnConnect = useCallback((params) => {
    setEdges((eds) => {
      const exit = eds.find(edge => (edge.source === params.target && edge.target === params.source)
        || (edge.target === params.target && edge.source === params.source))
      return !exit ? addEdge(params, eds) : eds
    })
  }, [setEdges]);

  return (
    <>
      <div className='sidebar'>
        <button onClick={onAddClick}>新增节点1</button>
        <button onClick={onAddClick}>新增节点2</button>
        <button onClick={onAddClick}>新增节点3</button>
        <button onClick={onAddClick}>新增节点4</button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={onEdgeClick}
        autoPanOnConnect
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineComponent={CustomConnectionLine}
        connectionLineStyle={connectionLineStyle}
      >
        <MiniMap />
      </ReactFlow>
    </>
  );
};

export default EasyConnectExample;
