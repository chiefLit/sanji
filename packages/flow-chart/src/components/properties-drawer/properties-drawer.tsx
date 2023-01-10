import React from 'react'
import { Button, Drawer, DrawerProps, Space } from 'antd'
import { FlowContext } from '../../context'
import { PropertiesProps } from '../../types'
import { EditableTitle } from '../editable-title/editable-title'

interface PropertiesDrawerProps extends DrawerProps { }

const PropertiesDrawer: React.FC<PropertiesDrawerProps> = () => {
  const { editingNode, setEditingNode, updateNodeProperties } = React.useContext(FlowContext)
  const [properties, setProperties] = React.useState<PropertiesProps>(editingNode ? { ...editingNode.properties } : {})

  React.useEffect(() => {
    if (editingNode?.properties) {
      setProperties(editingNode?.properties)
    }
  }, [editingNode])

  if (!editingNode) return null

  const handleClose = () => {
    setEditingNode(undefined)
  }

  const hanldeChangeTitle = (value: string) => {
    setProperties({ ...properties, nodeTitle: value })
  }

  const handleSubmit = () => {
    updateNodeProperties({
      nodeKey: editingNode.nodeKey,
      newProperties: properties,
    })
    setEditingNode(undefined)
  }

  return (
    <Drawer
      open={!!editingNode}
      onClose={handleClose}
      title={<EditableTitle title={properties?.nodeTitle!} onTitleChange={hanldeChangeTitle} />}
      width={640}
      footer={
        <Space align="end">
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} type="primary">提交</Button>
        </Space>
      }
    >
      {JSON.stringify(editingNode.properties)}
    </Drawer>
  )
}

export { PropertiesDrawer }
