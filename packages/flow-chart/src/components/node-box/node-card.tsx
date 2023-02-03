import React, { useMemo, useRef } from 'react'
import { Button, Tooltip, Popconfirm } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { LinkedList, RenderTypeEnum } from '../../types'
import { FlowContext } from '../../context'
import { EditableTitle } from '../editable-title/editable-title'
import { isBranch } from '../../utils'
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
    if (data.renderType === RenderTypeEnum.Normal || data.renderType === RenderTypeEnum.Loop) {
      onDeleteNode?.({ targetNodeKey: data.nodeKey })
    } else {
      onDeleteBranch?.({ targetBranchKey: data.nodeKey })
    }
  }

  const hanldeChangeTitle = (nodeTitle: string) => {
    updateNodeProperties({
      nodeKey: data.nodeKey,
      newProperties: { ...data?.properties, nodeTitle },
    })
  }

  const renderEnd = () => {
    return (
      <div className={`${prefixCls}-end-node-wrapper`}>
        {typeConfig[data.nodeType]?.icon as React.ReactElement}
        <span style={{ marginLeft: '4px' }}>结束</span>
      </div>
    )
  }

  const renderNotEnd = () => {
    return (
      <section className={`${prefixCls}-node-card-wrapper`} ref={divRef}>
        {/* 删除按钮 */}
        {data.nodeKey !== flowData.nodeKey && !readonly && !hideDeleteNode && (
          <Popconfirm
            overlayStyle={{ width: '220px' }}
            title={isBranch(data.renderType) ? '确定删除该分支，同时删除该分支下所有节点吗？' : '确定删除该节点吗？'}
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
              disabled={readonly}
              title={data?.properties?.nodeTitle}
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

  return data.renderType === RenderTypeEnum.End ? renderEnd() : renderNotEnd()
}

export { NodeCard }
