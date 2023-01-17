import React, { useCallback } from 'react'
import { message } from 'antd'
import { FlowContextProps } from './type'
import {
  FlowTableData,
  CommonProperties,
  FlowTableProps,
  RenderTypeEnum,
} from '../types'
import { getUniqId } from '../utils'

/**
 * 样式前缀，保证和 varible.less 一致。
 */
const prefixCls = 'tf'

const FlowContext = React.createContext<FlowContextProps>({} as FlowContextProps)

interface FlowProviderProps extends FlowTableProps {
  children: React.ReactNode
}

const FlowProvider: React.FC<FlowProviderProps> = (props) => {
  const {
    children,
    value,
    typeConfig,
    onClickAddNodeBtn,
    onClickNode,
    customAddNode,
    customNodeProperties,
    renderToolbar,
    readonly,
    renderNode,
    ...events
  } = props
  const [flowData, setFlowDataState] = React.useState<FlowTableData>(value)
  const [flowMap, setFlowMap] = React.useState<Record<string, FlowTableData>>()
  const [editingNode, setEditingNode] = React.useState<FlowTableData>()
  const [history, setHistory] = React.useState<FlowTableData[]>([value])
  const flowDataRef = React.useRef<FlowTableData>(value)

  /**
   * 设置 Flow 的时候需要先记录一下历史
   */
  const setFlowData = useCallback((next: FlowTableData) => {
    setHistory([...history, next])
    setFlowDataState(next)
  }, [history])

  /**
   * 改变节点结构的时候返回新的流程
   */
  const getNewFlowData = (flowData: FlowTableData) => {
    const copy = JSON.parse(JSON.stringify(flowData))
    const flowMap = linkedListToMap(copy)
    setFlowMap(flowMap)
    return { newData: copy, flowMap }
  }

  React.useEffect(() => {
    flowDataRef.current = flowData
    const fMap = linkedListToMap(flowData)
    setFlowMap(fMap)
    events.onChange?.(flowData)
  }, [flowData])

  /**
   * 添加节点
   * @param newSon 新增节点
   * @param father 目标节点
   */
  const onAddNode = React.useCallback((params: {
    previousNodeKey: string
    nodeType: string
    extraProperties?: Record<string, unknown>
  }) => {
    const { previousNodeKey, nodeType } = params
    const { newData, flowMap } = getNewFlowData(flowDataRef.current)
    const previousNode = flowMap[previousNodeKey]

    events.beforeAddNode?.({ previousNode, nodeType })

    const mainConf = typeConfig?.[nodeType]

    if (!mainConf) {
      console.error(`没找到当前 nodeType: ${mainConf}`)
      return
    }

    const newSon: FlowTableData = {
      nodeKey: getUniqId(),
      nodeType,
      renderType: mainConf.renderType,
      nextNode: previousNode.nextNode,
      preNodeKey: previousNode.nodeKey,
      properties: {
        nodeTitle: mainConf.nodeTitle || nodeType,
        ...mainConf.defaultProperties,
      },
    }

    if (
      mainConf.renderType === RenderTypeEnum.Interflow ||
      mainConf.renderType === RenderTypeEnum.Condition
    ) {
      if (mainConf?.conditionNodeType) {
        const subConf = typeConfig?.[mainConf?.conditionNodeType]
        if (mainConf?.condition) {
          newSon.conditionNodes = mainConf.condition.defaultPropertiesList.map(
            (p) => ({
              nodeKey: getUniqId(),
              nodeType: mainConf.conditionNodeType as string,
              renderType: subConf.renderType,
              condition: true,
              properties: { ...p },
              preNodeKey: newSon.nodeKey,
            }),
          )
        }
      }
    }

    if (previousNode.nextNode) {
      previousNode.nextNode.preNodeKey = newSon.nodeKey
    }
    previousNode.nextNode = newSon
    setFlowData({ ...newData })
    events.afterAddNode?.({ previousNode, targetNode: newSon })
  }, [events, setFlowData, typeConfig])

  /**
   * 删除节点
   * @param targetNode 待删除的节点
   */
  const onDeleteNode = React.useCallback(({ targetNodeKey }: {
    targetNodeKey: string
  }) => {
    const { newData, flowMap } = getNewFlowData(flowDataRef.current)
    const targetNode = flowMap[targetNodeKey]
    events.beforeDeleteNode?.({ targetNode })
    if (!flowMap || !targetNode.preNodeKey) return undefined
    if (targetNode.nodeKey === newData.nodeKey) {
      console.error('不能删除起始节点')
      return undefined
    }
    const previousNode = flowMap[targetNode.preNodeKey]
    if (targetNode.nextNode?.nodeKey) {
      targetNode.nextNode.preNodeKey = previousNode?.nodeKey
      previousNode.nextNode = targetNode.nextNode
    } else {
      previousNode.nextNode = undefined
    }
    setFlowData(newData)
    events.afterDeleteNode?.({ targetNode })
    return newData
  }, [events, setFlowData])

  /**
   * 添加分支
   * @param targetNode 需要添加分支的节点
   */
  const onAddBranch = React.useCallback(({ targetNodeKey, extraProperties }: {
    targetNodeKey: string;
    extraProperties?: Record<string, unknown>;
  }) => {
    const { newData, flowMap } = getNewFlowData(flowDataRef.current)
    const targetNode = flowMap[targetNodeKey]
    events.beforeAddBranch?.({ targetNode })
    const branchNTData = typeConfig[targetNode.nodeType]
    const conditionNTData = typeConfig[branchNTData?.conditionNodeType as string]
    targetNode.conditionNodes?.push({
      nodeKey: getUniqId(),
      nodeType: (branchNTData.conditionNodeType as string) || targetNode.nodeType,
      renderType: targetNode.renderType,
      condition: true,
      properties: {
        nodeTitle: conditionNTData.nodeTitle || branchNTData?.conditionNodeType,
        ...extraProperties,
        ...(conditionNTData.defaultProperties),
      },
      preNodeKey: targetNode.nodeKey,
    })
    setFlowData(newData)
    events.afterAddBranch?.({ targetNode })
  }, [events, setFlowData, typeConfig])

  /**
   * 删除分支
   * @param targetNode 需要删除的节点 [bug]
   */
  const onDeleteBranch = React.useCallback(({ targetBranchKey }: {
    targetBranchKey: string
  }) => {
    const { newData, flowMap } = getNewFlowData(flowDataRef.current)
    const targetBranch = flowMap[targetBranchKey]
    events.beforeDeleteBranch?.({ targetBranch })
    if (!flowMap || !targetBranch.preNodeKey) return
    const previousNode = flowMap[targetBranch.preNodeKey]
    if (
      previousNode.conditionNodes?.length &&
      previousNode.conditionNodes?.length > 2
    ) {
      previousNode.conditionNodes = previousNode.conditionNodes?.filter(
        (item) => item.nodeKey !== targetBranch.nodeKey,
      )
    } else {
      // 分支主节点
      const targetNode = previousNode
      if (!flowMap || !targetNode.preNodeKey) return
      if (targetNode.nodeKey === newData.nodeKey) {
        console.error('不能删除起始节点')
        return
      }
      const pNode = flowMap[targetNode.preNodeKey]
      // 当删除剩余最后两条分支a、b时，删除a需要保留b内的所有节点替换分支节点。
      const reservedNode = previousNode.conditionNodes?.find((item) => item.nodeKey !== targetBranch.nodeKey)?.nextNode
      // 保留节点内容
      if (reservedNode) {
        const reservedLastNode = findLastNode(reservedNode)
        if (reservedLastNode?.nodeKey) {
          reservedNode.preNodeKey = pNode?.nodeKey
          pNode.nextNode = reservedNode
          reservedLastNode.nextNode = targetNode.nextNode
        } else {
          pNode.nextNode = undefined
        }
      } else {
        if (targetNode.nextNode?.nodeKey) {
          targetNode.nextNode.preNodeKey = pNode?.nodeKey
          pNode.nextNode = targetNode.nextNode
        } else {
          pNode.nextNode = undefined
        }
      }
    }
    setFlowData(newData)
    events.afterDeleteBranch?.({ targetBranch })
  }, [events, setFlowData])

  /**
   * 通过节点id获取节点信息
   * @param id
   * @returns
   */
  const getNodeByKey = useCallback((nodeKey: string) => {
    if (!flowMap || !nodeKey) return undefined
    const node = flowMap[nodeKey]
    if (!node) message.error(`未找到 key 为 ${nodeKey} 的节点`)
    return node
  }, [flowMap])

  /**
   * 更新节点数据
   * @param params
   */
  const updateNodeProperties = useCallback((params: {
    nodeKey: string;
    newProperties: CommonProperties & Record<string, unknown>
  }) => {
    const { nodeKey, newProperties } = params
    const currentNode = getNodeByKey(nodeKey)
    if (currentNode) {
      currentNode.properties = newProperties
      const newData = { ...flowData }
      setFlowDataState(newData)
      setHistory(
        history.map((item, index) =>
          index === history.length - 1 ? newData : item,
        ),
      )
    }
  }, [flowData, getNodeByKey, history])

  /**
   * 前进
   */
  const forward = useCallback(() => {
    const index = history.findIndex((v) => v === flowData)
    if (index === history.length - 1 || index === -1) {
      message.info('无法前进')
    } else {
      setFlowDataState(history[index + 1])
    }
  }, [flowData, history])

  /**
   * 撤回
   */
  const revoke = useCallback(() => {
    const index = history.findIndex((v) => v === flowData)
    if (index === 0 || index === -1) {
      message.info('无法撤回')
    } else {
      setFlowDataState(history[index - 1])
    }
  }, [flowData, history])

  /**
   * 改变分支顺序
   */
  const changeBranchIndex = useCallback((params: {
    targetNode: FlowTableData
    fromIndex: number
    toIndex: number
  }) => {
    const { targetNode, fromIndex, toIndex } = params
    const { newData, flowMap } = getNewFlowData(flowDataRef.current)
    const nextNode = flowMap[targetNode.nodeKey]
    if (!nextNode.conditionNodes) return
    const formBranch = nextNode.conditionNodes?.[fromIndex]
    const toBranch = nextNode.conditionNodes?.[toIndex]
    if (!formBranch) return
    if (!toBranch) return
    nextNode.conditionNodes[toIndex] = formBranch
    nextNode.conditionNodes[fromIndex] = toBranch
    setFlowData(newData)
  }, [setFlowData])

  const providerValue = React.useMemo(() => {
    return {
      flowData,
      flowMap,
      typeConfig,
      onAddNode: events.onAddNode || onAddNode,
      onDeleteNode: events.onDeleteNode || onDeleteNode,
      onAddBranch: events.onAddBranch || onAddBranch,
      onDeleteBranch: events.onDeleteBranch || onDeleteBranch,
      editingNode,
      setEditingNode,
      forward,
      revoke,
      updateNodeProperties,
      getNodeByKey,
      prefixCls,
      onClickAddNodeBtn,
      onClickNode,
      customAddNode,
      customNodeProperties,
      renderToolbar,
      changeBranchIndex,
      readonly,
      flowHistory: history,
      renderNode,
    }
  }, [
    flowData,
    flowMap,
    typeConfig,
    events.onAddNode,
    events.onDeleteNode,
    events.onAddBranch,
    events.onDeleteBranch,
    onAddNode,
    onDeleteNode,
    onAddBranch,
    onDeleteBranch,
    editingNode,
    forward,
    revoke,
    updateNodeProperties,
    getNodeByKey,
    onClickAddNodeBtn,
    onClickNode,
    customAddNode,
    customNodeProperties,
    renderToolbar,
    changeBranchIndex,
    readonly,
    history,
    renderNode,
  ])

  return (
    <FlowContext.Provider value={providerValue}>
      {children}
    </FlowContext.Provider>
  )
}


/**
 * 寻找当前链表中最后一位
 * @param node 
 * @returns 
 */
const findLastNode = (node: FlowTableData): FlowTableData => {
  return node?.nextNode ? findLastNode(node?.nextNode) : node
}

/**
 * 链表数据转map
 * @param data
 * @returns
 */
const linkedListToMap = (data: FlowTableData) => {
  const result: Record<string, FlowTableData> = {}
  result[data.nodeKey] = Object.assign(data)
  if (data?.nextNode) {
    Object.assign(result, linkedListToMap(data?.nextNode))
  }
  if (data?.conditionNodes) {
    data?.conditionNodes.forEach((node) => {
      Object.assign(result, linkedListToMap(node))
    })
  }
  return result
}

export { FlowContext, FlowProvider }
