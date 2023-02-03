import React, { useContext } from "react";
import { FlowContext } from "../../context";
import { LinkedList } from "../../types";
import { AddNodeButton } from "../add-node-button/add-node-button";
import { NodeBox, NodeCard } from "../node-box";
import './style.less'

interface LoopBoxProps {
  data: LinkedList
}

const LoopBox: React.FC<LoopBoxProps> = (props) => {
  const { data } = props
  const flowContext = useContext(FlowContext)
  const { prefixCls, renderNode } = flowContext

  return (
    <div className={`${prefixCls}-loop-node-box-wrapper`}>
      <div className={`${prefixCls}-loop-content`}>
        <NodeCard data={data} />
        <AddNodeButton data={data} isLoop />
        {data.loopNode && <NodeBox data={data.loopNode} />}
      </div>
      <AddNodeButton data={data} />
    </div>
  );
}

export { LoopBox };