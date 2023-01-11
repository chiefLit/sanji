import { FlowContextProps } from './context'

/**
 * 流程表入参
 */
export interface FlowTableProps {
  /**
   * 值
   */
  value: FlowTableData

  /**
   * 添加节点前
   */
  onChange?: (data: FlowTableData) => void

  readonly?: boolean

  /**
   * 业务节点配置
   */
  typeConfig: TypeConfigData

  /**
   * 自定义渲染节点
   */
  renderNode?: (params: {
    targetNode: FlowTableData
    flowContext: FlowContextProps
  }) => React.ReactNode

  /**
   * 点击添加节点按钮事件，如果绑定该事件默认的逻辑将不执行。(todo：需要将点击【+】和【normal】做一下区别，)
   */
  onAddNode?: (params: {
    previousNodeKey: string
    nodeType: string
    extraProperties?: Record<string, unknown>
  }) => void

  /**
   * 点击删除节点按钮事件，如果绑定该事件默认的逻辑将不执行。
   */
  onDeleteNode?: (params: { targetNodeKey: string }) => void

  /**
   * 点击添加分支按钮事件，如果绑定该事件默认的逻辑将不执行。
   */
  onAddBranch?: (params: {
    targetNodeKey: string
    extraProperties?: Record<string, unknown>
  }) => void

  /**
   * 点击删除分支按钮事件，如果绑定该事件默认的逻辑将不执行。
   */
  onDeleteBranch?: (params: { targetBranchKey: string }) => void

  /**
   * 添加节点前回调
   */
  beforeAddNode?: (params: {
    previousNode: FlowTableData
    nodeType: string
  }) => void

  /**
   * 添加节点后回调
   */
  afterAddNode?: (parmas: {
    previousNode: FlowTableData
    targetNode: FlowTableData
  }) => void

  /**
   * 删除节点前回调
   */
  beforeDeleteNode?: (params: { targetNode: FlowTableData }) => void

  /**
   * 删除节点后回调
   */
  afterDeleteNode?: (params: { targetNode: FlowTableData }) => void

  /**
   * 添加分支前回调
   */
  beforeAddBranch?: (params: { targetNode: FlowTableData }) => void

  /**
   * 添加分支后回调
   */
  afterAddBranch?: (params: { targetNode: FlowTableData }) => void

  /**
   * 删除分支前回调
   */
  beforeDeleteBranch?: (params: { targetBranch: FlowTableData }) => void

  /**
   * 删除分支后回调
   */
  afterDeleteBranch?: (params: { targetBranch: FlowTableData }) => void

  /**
   * 点击添加节点回调函数，设置该回调之后，不执行默认的添加节点逻辑需要自定义
   */
  onClickAddNodeBtn?: (params: { previousNode: FlowTableData }) => void
  /**
   * 点击节点回调，设置该回调之后，不执行默认的逻辑
   */
  onClickNode?: (params: { targetNode: FlowTableData }) => void

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
  renderToolbar?: (
    flowData: FlowTableData,
    context: Pick<FlowContextProps, 'revoke' | 'forward'>,
  ) => React.ReactNode

  changeBranchIndex?: (params: {
    targetNode: FlowTableData
    fromIndex: number
    toIndex: number
  }) => void
}

/**
 * 流程数据
 * 采用链表的结构  LinkedList
 */
export type FlowTableData<T = PropertiesProps> = {
  /**
   * 节点id
   */
  nodeKey: string

  /**
   * 父级节点标识
   */
  preNodeKey?: string

  /**
   * 子节点标识
   */
  nextNodeKey?: string

  /**
   * 节点业务类型
   */
  nodeType: string

  /**
   * 节点渲染类型
   */
  renderType: RenderTypeEnum | keyof typeof RenderTypeEnum

  /**
   * 节点的业务属性，及显示在侧滑窗里面的内容
   */
  properties?: T

  /**
   * 子节点
   */
  nextNode?: FlowTableData

  /**
   * 条件节点
   */
  conditionNodes?: FlowTableData[]

  [key: string]: unknown
}

export type PropertiesProps = CommonProperties & Record<string, unknown>

export type TypeConfigData = { [nodeType: string]: TypeConfigItem }

export type TypeConfigItem = {
  renderType: RenderTypeEnum
  nodeTitle: string
  conditionNodeType?: string
  defaultProperties?: Record<string, unknown>
  hideAddNode?: (targetNode: FlowTableData) => boolean
  hideDeleteNode?: (targetNode: FlowTableData) => boolean
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
   * 普通节点
   */
  'Normal' = 'Normal',
  /**
   * 排他节点
   */
  'Condition' = 'Condition',
  /**
   * 包容节点
   */
  'Interflow' = 'Interflow',
  /**
   * 结束节点
   */
  'End' = 'End',
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
  getNodeByKey: (id: string) => FlowTableData | undefined

  /**
   * 前进
   */
  forward: () => void

  /**
   * 后退
   */
  revoke: () => void
}
