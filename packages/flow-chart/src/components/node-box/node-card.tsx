import React, { useMemo, useRef } from 'react'
import { Button, Tooltip, Popconfirm } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { LinkedList, RenderTypeEnum } from '../../types'
import { FlowContext } from '../../context'
import { EditableTitle } from '../editable-title/editable-title'
import './style.less'

interface NodeCardProps {
  data: LinkedList
}

/**
 * 节点卡片
 */
const NodeCard: React.FC<NodeCardProps> = (props) => {
  const { data } = props
  const {
    onClickNode,
    onDeleteNode,
    onDeleteBranch,
    setEditingNode,
    updateNodeProperties,
    typeConfig,
    prefixCls,
    customNodeProperties,
    readonly,
    flowData
  } = React.useContext(FlowContext)

  const hideDeleteNode = useMemo(
    () => typeConfig[data.nodeType]?.hideDeleteNode?.(data),
    [typeConfig, data],
  )

  const [nodeContent, isErrorContent] = useMemo(() => {
    return [data?.properties?.nodeContent, false]
  }, [data?.properties])

  const divRef = useRef<HTMLElement>(null)

  const handleClose = (e?: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e?.stopPropagation()
    if (data.renderType === RenderTypeEnum.Condition || data.renderType === RenderTypeEnum.ConditionElse) {
      onDeleteBranch?.({ targetBranchKey: data.nodeKey })
    } else {
      onDeleteNode?.({ targetNodeKey: data.nodeKey })
    }
  }

  const hanldeChangeTitle = (nodeTitle: string) => {
    updateNodeProperties({
      nodeKey: data.nodeKey,
      newProperties: { ...data?.properties, nodeTitle },
    })
  }

  const isStartOrEnd = data.renderType === RenderTypeEnum.Start || data.renderType === RenderTypeEnum.End

  // 是否可删除节点
  const isDeletable = data.preNodeKey
    && !readonly
    && !hideDeleteNode
    && !isStartOrEnd
    && data.renderType !== RenderTypeEnum.ConditionElse

  return (
    <section className={`${prefixCls}-node-card-wrapper`} ref={divRef}>
      {/* 删除按钮 */}
      {isDeletable && (
        <Popconfirm
          overlayStyle={{ width: '200px' }}
          title={
            data.renderType === RenderTypeEnum.Condition
              ? '确定删除该分支，同时删除该分支下所有节点吗？'
              : '确定删除该节点吗？'
          }
          getTooltipContainer={() => divRef.current!}
          onConfirm={handleClose}
          placement="rightTop"
        >
          <Button
            className={`${prefixCls}-node-card-close-button`}
            type="text"
            icon={<CloseOutlined />}
            size="small"
          />
        </Popconfirm>
      )}
      <div
        className={`${prefixCls}-node-card-mask`}
        onClick={() => {
          if (!customNodeProperties) setEditingNode(data)
          onClickNode?.({ targetNode: data })
        }}
      >
        {/* 头 */}
        <header className={`${prefixCls}-node-card-title`}>
          {typeConfig[data.nodeType]?.icon as React.ReactElement}
          <EditableTitle
            disabled={readonly || isStartOrEnd}
            title={data?.properties?.nodeTitle || data?.properties?.name}
            onTitleChange={hanldeChangeTitle}
          />
        </header>
        {/* 身 */}
        <article className={`${prefixCls}-node-card-content`}>
          <Tooltip placement="bottom" title={nodeContent} arrowPointAtCenter>
            <span style={isErrorContent ? { color: '#FF4647' } : {}}>
              {nodeContent}
            </span>
          </Tooltip>
        </article>
      </div>
    </section>
  )

}

export { NodeCard }
