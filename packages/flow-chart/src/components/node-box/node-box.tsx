import React, { useContext, useMemo } from 'react'
import { LinkedList, RenderTypeEnum } from '../../types'
import { AddNodeButton } from '../add-node-button/add-node-button'
import { NodeCard } from './node-card'
import { FlowContext } from '../../context'
import { BranchBox } from '../branch-box'
import './style.less'

interface NodeBoxProps {
  data: LinkedList
}

const NodeBox: React.FC<NodeBoxProps> = (props) => {
  const { data } = props
  const flowContext = useContext(FlowContext)
  const { flowMap, prefixCls, typeConfig, renderNode } = flowContext

  const hideAddNode = useMemo(
    () => typeConfig[data.nodeType]?.hideAddNode?.(data),
    [typeConfig, data],
  )

  // 防止结束节点闪动
  if (!flowMap) return null

  return (
    <>
      {data?.conditionNodes &&
        data?.renderType !== 'Normal' &&
        data?.renderType !== RenderTypeEnum.End ? (
        <BranchBox data={data} />
      ) : (
        <div
          className={`
          ${prefixCls}-node-box-wrapper 
          ${data.renderType === RenderTypeEnum.End ? `${prefixCls}-node-box-end-wrapper` : ''}
          `}
        >
          {renderNode ? (
            renderNode({ targetNode: data, flowContext })
          ) : (
            <NodeCard data={data} />
          )}
          {data.renderType !== RenderTypeEnum.End && (
            <AddNodeButton data={data} hideButton={hideAddNode} />
          )}
        </div>
      )}
      {data?.nextNode ? <NodeBox data={data?.nextNode} /> : null}
    </>
  )
}

export { NodeBox }
