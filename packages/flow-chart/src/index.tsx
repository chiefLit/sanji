import React, { forwardRef } from 'react'
import { FlowContext, FlowContextProps, FlowProvider } from './context'
import { FlowTableProps } from './types'
import { PropertiesDrawer } from './components/properties-drawer'
import { Toolbar } from './components/toolbar'
import { MoveStage } from './components/move-stage'
import { StageProvider } from './components/move-stage/context'
import { NodeBox } from './components/node-box/node-box'
import './styles/index.less'

/**
 * 先全量透出之后整理 todo
 */
export type FlowTableInstance = FlowContextProps

const FlowTable = forwardRef<FlowTableInstance>(function FlowTable(_, ref) {
  const flowContext = React.useContext(FlowContext)
  const { flowData, flowMap, editingNode, prefixCls, customNodeProperties } = flowContext
  React.useImperativeHandle(ref, () => ({ ...flowContext }), [flowMap])
  return (
    <div className={`${prefixCls}-flow-table-wrapper`}>
      <NodeBox data={flowData} />
      {!customNodeProperties ? (
        <PropertiesDrawer open={!!editingNode} destroyOnClose />
      ) : null}
    </div>
  )
})

const App = forwardRef<
  Pick<
    FlowTableInstance,
    | 'onAddNode'
    | 'updateNodeProperties'
    | 'getNodeByKey'
    | 'onClickNode'
    | 'onDeleteNode'
    | 'onDeleteBranch'
    | 'setEditingNode'
    | 'updateNodeProperties'
  >,
  FlowTableProps
>(function App(props, ref) {
  const flowTableRef = React.useRef<FlowTableInstance>(null)

  // 开放能力
  React.useImperativeHandle(ref, () => ({
    onAddNode: (props) => flowTableRef.current?.onAddNode?.(props),
    updateNodeProperties: (props) => flowTableRef.current?.updateNodeProperties(props),
    getNodeByKey: (props) => flowTableRef.current?.getNodeByKey(props),
    onClickNode: (props) => flowTableRef.current?.onClickNode?.(props),
    onDeleteNode: (props) => flowTableRef.current?.onDeleteNode?.(props),
    onDeleteBranch: (props) => flowTableRef.current?.onDeleteBranch?.(props),
    setEditingNode: (props) => flowTableRef.current?.setEditingNode?.(props),
  }))

  return (
    <StageProvider>
      <FlowProvider {...props}>
        <Toolbar />
        <MoveStage>
          <FlowTable ref={flowTableRef} />
        </MoveStage>
      </FlowProvider>
    </StageProvider>
  )
})

export default App
