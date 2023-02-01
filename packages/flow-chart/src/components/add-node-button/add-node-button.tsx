import React from 'react'
import { Button, Drawer } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Node } from '../../types'
import { FlowContext } from '../../context'
import './style.less'

interface AddNodeButtonProps {
  data: Node
  hideButton?: boolean
}

const AddNodeButton: React.FC<AddNodeButtonProps> = (props) => {
  const { data, hideButton } = props
  const { onAddNode, typeConfig, prefixCls, onClickAddNodeBtn, customAddNode, readonly, } = React.useContext(FlowContext)
  const [open, setOpen] = React.useState(false)

  const handleClick = (nodeType: string) => {
    onAddNode?.({ nodeType, previousNodeKey: data.nodeKey })
  }

  const content = Object.keys(typeConfig)
    ?.filter((type) => !typeConfig[type].createDisabled)
    .map((nodeType, index) => {
      return (
        <Button
          key={nodeType + index}
          onClick={() => {
            handleClick(nodeType)
            setOpen(false)
          }}
        >
          {typeConfig[nodeType].nodeTitle}
        </Button>
      )
    })

  return (
    <div className={`${prefixCls}-add-node-button`}>
      {!readonly && !hideButton && (
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            onClickAddNodeBtn?.({ previousNode: data })
            setOpen(true)
          }}
          shape="circle"
          size="small"
        />
      )}
      {/* 自定义添加节点 */}
      {!customAddNode ? (
        <Drawer
          title="添加节点"
          placement="right"
          onClose={() => setOpen(false)}
          open={open}
          destroyOnClose
        >
          {content}
        </Drawer>
      ) : null}
    </div>
  )
}

export { AddNodeButton }
