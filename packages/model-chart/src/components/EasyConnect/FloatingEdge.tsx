import { useCallback } from 'react';
import { useStore, getStraightPath, Edge, EdgeLabelRenderer, EdgeText } from 'reactflow';

import { getEdgeParams } from './utils.js';

function FloatingEdge({ id, source, target, markerEnd, style }: Edge) {
  const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd as string}
        style={style}
      />
      <EdgeLabelRenderer>
        <div
          id={id}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#ffcc00',
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
            pointerEvents: 'all'
          }}
          className="nodrag nopan"
        >
          {id}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default FloatingEdge;
