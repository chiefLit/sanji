import { FlowTableProps, LinkedList, PropertiesProps, TypeConfigData } from "../types"

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
    | 'onAddLoopNode'
    | 'onAddNode'
    | 'onDeleteNode'
    | 'onAddBranch'
    | 'onDeleteBranch'
    | 'changeBranchIndex'
    | 'readonly'
    | 'renderNode'
  > {
  flowData: LinkedList
  flowMap?: Record<string, LinkedList>
  typeConfig: TypeConfigData
  /**
   * 正在编辑的节点
   */
  editingNode: LinkedList | undefined
  /**
   * 正在编辑的节点
   */
  setEditingNode: React.Dispatch<React.SetStateAction<LinkedList | undefined>>
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
  getNodeByKey: (nodeKey: string) => LinkedList | undefined
  /**
   * 样式前缀，保证和 varible.less 一致。
   */
  prefixCls: string
  flowHistory: Array<LinkedList> | []
}