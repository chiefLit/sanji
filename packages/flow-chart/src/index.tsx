import React, { forwardRef } from 'react'
import { FlowContext, FlowProvider } from './context'
import { FlowContextProps } from './context/type'
import { FlowTableProps } from './types'
import { PropertiesDrawer } from './components/properties-drawer'
import { Toolbar } from './components/toolbar'
import { MoveStage } from './components/move-stage'
import { StageProvider } from './components/move-stage/context'
import { NodeBox } from './components/node-box/node-box'
import { convertLinkedList2Map, convertMap2LinkedList } from './utils'
import './styles/index.less'

/**
 * 先全量透出之后整理 todo
 */
export type FlowTableInstance = FlowContextProps
export { convertLinkedList2Map, convertMap2LinkedList }

const FlowEngine = forwardRef<FlowTableInstance>(function FlowEngine(_, ref) {
  const flowContext = React.useContext(FlowContext)
  const { flowData, flowMap, editingNode, prefixCls, customNodeProperties } = flowContext
  React.useImperativeHandle(ref, () => ({ ...flowContext }), [flowMap])
  return (
    <>
      <Toolbar />
      <MoveStage>
        <div className={`${prefixCls}-flow-table-wrapper`}>
          <NodeBox data={flowData} />
        </div>
      </MoveStage>
      {!customNodeProperties ? (
        <PropertiesDrawer open={!!editingNode} destroyOnClose />
      ) : null}
    </>
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
    onAddNode: (p) => flowTableRef.current?.onAddNode?.(p),
    updateNodeProperties: (p) => flowTableRef.current?.updateNodeProperties(p),
    getNodeByKey: (p) => flowTableRef.current?.getNodeByKey(p),
    onClickNode: (p) => flowTableRef.current?.onClickNode?.(p),
    onDeleteNode: (p) => flowTableRef.current?.onDeleteNode?.(p),
    onDeleteBranch: (p) => flowTableRef.current?.onDeleteBranch?.(p),
    setEditingNode: (p) => flowTableRef.current?.setEditingNode?.(p),
  }))

  return (
    <StageProvider>
      <FlowProvider {...props}>
        <FlowEngine ref={flowTableRef} />
      </FlowProvider>
    </StageProvider>
  )
})

export default App
