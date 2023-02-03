import React, { useContext, useMemo } from 'react'
import { LinkedList, RenderTypeEnum } from '../../types'
import { AddNodeButton } from '../add-node-button/add-node-button'
import { NodeCard } from './node-card'
import { FlowContext } from '../../context'
import { BranchBox } from '../branch-box'
import { isBranch } from '../../utils'
import { LoopBox } from '../loop-box'
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

  const _isBranch = data?.conditionNodes && isBranch(data?.renderType)
  const _isLoop = data?.renderType === RenderTypeEnum.Loop

  const renderNormalNode = () => (
    <div
      className={`
        ${prefixCls}-node-box-wrapper 
        ${data.renderType === RenderTypeEnum.End ? `${prefixCls}-node-box-end-wrapper` : ''}
      `}
    >
      {
        renderNode
          ? renderNode({ targetNode: data, flowContext })
          : <NodeCard data={data} />
      }
      {data.renderType !== RenderTypeEnum.End && <AddNodeButton data={data} hideButton={hideAddNode} />}
    </div>
  )

  return (
    <>
      {_isBranch && <BranchBox data={data} />}
      {_isLoop && <LoopBox data={data} />}
      {!_isBranch && !_isLoop && renderNormalNode()}
      {data?.nextNode ? <NodeBox data={data?.nextNode} /> : null}
    </>
  )
}

export { NodeBox }
