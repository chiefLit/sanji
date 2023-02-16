import { FlowContextProps } from './context/type'

export type ActionType = 'ADD_NODE' | 'DELETE_NODE' | 'UPDATE_NODE'
  | 'ADD_BRANCH' | 'DELETE_BRANCH' | 'CHANGE_BRANCH_INDEX' | 'FORWARD' | 'REVOKE'

/**
 * 流程表入参
 */
export interface FlowTableProps {
  /**
   * 值
   */
  value: LinkedList

  /**
   * 添加节点前
   */
  onChange?: (props: {
    action: ActionType;
    node?: LinkedList;
    addNodes?: LinkedList[];
    updateNodes?: LinkedList[];
    deleteNodes?: LinkedList[];
    flow: LinkedList;
  }) => void

  /**
   * 只读
   */
  readonly?: boolean

  /**
   * 业务节点配置
   */
  typeConfig: TypeConfigData

  /**
   * 自定义渲染节点
   */
  renderNode?: (params: { targetNode: Node; flowContext: FlowContextProps }) => React.ReactNode

  /**
   * 点击添加节点按钮事件，如果绑定该事件默认的逻辑将不执行。(todo：需要将点击【+】和【normal】做一下区别，)
   */
  onAddNode?: (params: { previousNodeKey: string; nodeType: string; extraProperties?: Record<string, unknown> }) => void

  /**
   * 添加循环开始节点
   * @param params 
   * @returns 
   */
  onAddLoopNode?: (params: { previousNodeKey: string; nodeType: string; extraProperties?: Record<string, unknown> }) => void

  /**
   * 点击删除节点按钮事件，如果绑定该事件默认的逻辑将不执行。
   */
  onDeleteNode?: (params: { targetNodeKey: string }) => void

  /**
   * 点击添加分支按钮事件，如果绑定该事件默认的逻辑将不执行。
   */
  onAddBranch?: (params: { targetNodeKey: string; extraProperties?: Record<string, unknown> }) => void

  /**
   * 点击删除分支按钮事件，如果绑定该事件默认的逻辑将不执行。
   */
  onDeleteBranch?: (params: { targetBranchKey: string }) => void

  /**
   * 添加节点前回调
   */
  beforeAddNode?: (params: { previousNode: Node; nodeType: string, isLoop?: boolean }) => void

  /**
   * 添加节点后回调
   */
  afterAddNode?: (parmas: { previousNode: Node; targetNode: Node, isLoop?: boolean }) => void

  /**
   * 删除节点前回调
   */
  beforeDeleteNode?: (params: { targetNode: Node }) => void

  /**
   * 删除节点后回调
   */
  afterDeleteNode?: (params: { targetNode: Node }) => void

  /**
   * 添加分支前回调
   */
  beforeAddBranch?: (params: { targetNode: Node }) => void

  /**
   * 添加分支后回调
   */
  afterAddBranch?: (params: { targetNode: Node }) => void

  /**
   * 删除分支前回调
   */
  beforeDeleteBranch?: (params: { targetBranch: Node }) => void

  /**
   * 删除分支后回调
   */
  afterDeleteBranch?: (params: { targetBranch: Node }) => void

  /**
   * 点击添加节点回调函数，设置该回调之后，不执行默认的添加节点逻辑需要自定义
   */
  onClickAddNodeBtn?: (params: { previousNode: Node, isLoop?: boolean }) => void
  /**
   * 点击节点回调，设置该回调之后，不执行默认的逻辑
   */
  onClickNode?: (params: { targetNode: Node }) => void

  /**
   * 自定义添加节点
   */
  customAddNode?: boolean

  /**
   * 自定义渲染节点配置
   */
  customNodeProperties?: boolean

  /**
   * 自定义渲染 toolbar
   */
  renderToolbar?: (flowData: Node, context: Pick<FlowContextProps, 'revoke' | 'forward'>,) => React.ReactNode

  /**
   * 改变分支排序
   * @param params 
   * @returns 
   */
  changeBranchIndex?: (params: { targetNode: Node; fromIndex: number; toIndex: number }) => void
}

export type Node<T = any> = {
  nodeKey: string;
  preNodeKey?: string;
  nextNodeKey?: string;
  nodeType: string;
  renderType: RenderTypeEnum | keyof typeof RenderTypeEnum;
  properties?: T;
  conditionNodeKeys?: string[];
  loopNodeKey?: string;
}

export type LinkedList = Node & {
  nextNode?: LinkedList
  loopNode?: LinkedList
  conditionNodes?: LinkedList[]
}

export type PropertiesProps = CommonProperties & Record<string, unknown>

export type TypeConfigData = { [nodeType: string]: TypeConfigItem }

export type TypeConfigItem = {
  renderType: RenderTypeEnum
  nodeTitle: string
  conditionNodeType?: string
  defaultProperties?: Record<string, unknown>
  hideAddNode?: (targetNode: Node) => boolean
  hideDeleteNode?: (targetNode: Node) => boolean
  condition?: {
    conditionDefaultProperties?: Record<string, unknown>
    defaultPropertiesList: Record<string, unknown>[]
    hideAddBranch?: boolean
    hideIndex?: boolean
  }
  [key: string]: any
}

export enum RenderTypeEnum {
  /**
   * 开始节点
   */
  'Start' = 'Start',
  /**
   * 结束节点
   */
  'End' = 'End',
  /**
   * 普通节点
   */
  'Normal' = 'Normal',
  /**
   * 循环节点
   */
  'Loop' = 'Loop',
  /**
   * 排他节点
   */
  'Exclusive' = 'Exclusive',
  /**
   * 包容节点
   */
  'Inclusive' = 'Inclusive',
  /**
   * 条件节点
   */
  'Condition' = 'Condition',
  /**
   * 条件节点
   */
  'ConditionElse' = 'ConditionElse',
}

/**
 * 节点显示内容
 */
export type CommonProperties = {
  /**
   * 标题信息
   */
  nodeTitle?: string
  /**
   * 节点内容
   */
  nodeContent?: string
}

/**
 * 获取节点信息方法的单个项
 */
export type NodeTypeItem = {
  title: string

  type: RenderTypeEnum
}

export type FlowTableActions = {
  /**
   * 更新节点参数
   */
  updateNodeProperties: (params: {
    nodeKey: string
    newProperties: CommonProperties & Record<string, unknown>
  }) => void

  /**
   * 通过节点ID获取节点
   */
  getNodeByKey: (id: string) => Node | undefined

  /**
   * 前进
   */
  forward: () => void

  /**
   * 后退
   */
  revoke: () => void
}
