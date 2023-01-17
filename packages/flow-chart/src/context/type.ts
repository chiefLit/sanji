import { FlowTableData, FlowTableProps, TypeConfigData } from "../types"

/**
 * 流程相关的状态管理
 */
export interface FlowContextProps
  extends Pick<
    FlowTableProps,
    | 'customAddNode'
    | 'customNodeProperties'
    | 'onClickAddNodeBtn'
    | 'onClickNode'
    | 'renderToolbar'
    | 'onAddNode'
    | 'onDeleteNode'
    | 'onAddBranch'
    | 'onDeleteBranch'
    | 'changeBranchIndex'
    | 'readonly'
    | 'renderNode'
  > {
  flowData: FlowTableData
  flowMap?: Record<string, FlowTableData>
  typeConfig: TypeConfigData
  /**
   * 正在编辑的节点
   */
  editingNode: FlowTableData | undefined
  /**
   * 正在编辑的节点
   */
  setEditingNode: React.Dispatch<React.SetStateAction<FlowTableData | undefined>>
  /**
   * 前进
   */
  forward: () => void
  /**
   * 撤回
   */
  revoke: () => void
  /**
   * 更新节点配置
   */
  updateNodeProperties: (params: { nodeKey: string; newProperties: PropertiesProps }) => void
  /**
   * 通过key去找节点
   */
  getNodeByKey: (nodeKey: string) => FlowTableData | undefined
  /**
   * 样式前缀，保证和 varible.less 一致。
   */
  prefixCls: string
  flowHistory: Array<FlowTableData> | []
}