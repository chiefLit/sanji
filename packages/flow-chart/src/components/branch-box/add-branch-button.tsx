import React from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Node } from '../../types'
import { FlowContext } from '../../context'
import './style.less'

interface AddBranchButtonProps {
  data: Node
}

const AddBranchButton: React.FC<AddBranchButtonProps> = (props) => {
  const { data } = props
  const { onAddBranch, prefixCls } = React.useContext(FlowContext)

  const handleClick = () => {
    onAddBranch?.({ targetNodeKey: data.nodeKey })
  }

  return (
    <Button className={`${prefixCls}-add-branch-button`} size='small' icon={<PlusOutlined />} onClick={handleClick} />
  )
}

export { AddBranchButton }
