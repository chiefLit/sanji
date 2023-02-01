import React, { useCallback, useRef, useState, useEffect } from 'react'
import { message } from 'antd'
import { convertLinkedList2Map, findAllNodesFormLL, findLastNodeFormLL, getUniqId, isBranch } from '../utils'
import { FlowContextProps } from './type'
import {
  CommonProperties,
  FlowTableProps,
  Node,
  LinkedList,
  RenderTypeEnum,
} from '../types'

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
  const [flowData, setFlowDataState] = useState<LinkedList>(value)
  const [flowMap, setFlowMap] = useState<Record<string, Node>>()
  const [editingNode, setEditingNode] = useState<LinkedList>()
  const [history, setHistory] = useState<LinkedList[]>([value])
  const flowDataRef = useRef<LinkedList>(value)

  /**
   * 设置 Flow 的时候需要先记录一下历史
   */
  const setFlowData = useCallback((next: LinkedList) => {
    setHistory([...history, next])
    setFlowDataState(next)
  }, [history])

  /**
   * 改变节点结构的时候返回新的流程
   */
  const getNewFlowData = (flowData: LinkedList) => {
    const copy = JSON.parse(JSON.stringify(flowData))
    const flowMap = convertLinkedList2Map(copy)
    setFlowMap(flowMap)
    return { newData: copy, flowMap }
  }

  useEffect(() => {
    flowDataRef.current = flowData
    const fMap = convertLinkedList2Map(flowData)
    setFlowMap(fMap)
  }, [flowData])

  /**
   * 添加节点
   * @param newSon 新增节点
   * @param father 目标节点
   */
  const onAddNode = useCallback((params: {
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

    const newSon: LinkedList = {
      nodeKey: getUniqId(),
      nodeType,
      renderType: mainConf.renderType,
      preNodeKey: previousNode.nodeKey,
      nextNodeKey: previousNode.nextNode?.nodeKey,
      nextNode: previousNode.nextNode,
      properties: {
        nodeTitle: mainConf.nodeTitle || nodeType,
        ...mainConf.defaultProperties,
      },
    }

    if (isBranch(mainConf.renderType) && mainConf?.conditionNodeType && mainConf?.condition) {
      const subConf = typeConfig?.[mainConf?.conditionNodeType]
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
      newSon.conditionNodeKeys = newSon.conditionNodes.map(node => node.nodeKey)
      // 添加分支节点
      events.onChange?.({
        action: 'ADD_NODE',
        addNodes: [newSon, ...newSon.conditionNodes],
        updateNodes: [previousNode, newSon.nextNode!].filter(node => node),
        flow: newData
      })
    } else {
      // 添加普通节点
      events.onChange?.({
        action: 'ADD_NODE',
        addNodes: [newSon],
        updateNodes: [previousNode, newSon.nextNode!].filter(node => node),
        flow: newData
      })
    }

    if (previousNode.nextNode) {
      previousNode.nextNode.preNodeKey = newSon.nodeKey
    }
    previousNode.nextNodeKey = newSon.nodeKey
    previousNode.nextNode = newSon
    setFlowData({ ...newData })
    events.afterAddNode?.({ previousNode, targetNode: newSon })
  }, [events, setFlowData, typeConfig])

  /**
   * 删除节点
   * @param targetNode 待删除的节点
   */
  const onDeleteNode = useCallback(({ targetNodeKey }: {
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
    events.onChange?.({
      action: 'DELETE_NODE',
      flow: newData,
      deleteNodes: [targetNode],
      updateNodes: [previousNode, targetNode.nextNode!]
    })
    events.afterDeleteNode?.({ targetNode })
    return newData
  }, [events, setFlowData])

  /**
   * 添加分支
   * @param targetNode 需要添加分支的节点
   */
  const onAddBranch = useCallback(({ targetNodeKey, extraProperties }: {
    targetNodeKey: string;
    extraProperties?: Record<string, unknown>;
  }) => {
    const { newData, flowMap } = getNewFlowData(flowDataRef.current)
    const targetNode = flowMap[targetNodeKey]
    events.beforeAddBranch?.({ targetNode })
    const branchNTData = typeConfig[targetNode.nodeType]
    const conditionNTData = typeConfig[branchNTData?.conditionNodeType as string]
    const newBranch = {
      nodeKey: getUniqId(),
      nodeType: (branchNTData.conditionNodeType as string) || targetNode.nodeType,
      renderType: targetNode.renderType,
      preNodeKey: targetNode.nodeKey,
      properties: {
        nodeTitle: conditionNTData.nodeTitle || branchNTData?.conditionNodeType,
        ...extraProperties,
        ...(conditionNTData.defaultProperties),
      },
    }
    if (targetNode.renderType === RenderTypeEnum.Exclusive) {
      targetNode.conditionNodes?.splice(targetNode.conditionNodes?.length - 1, 0, newBranch)
    } else {
      targetNode.conditionNodes?.push(newBranch)
    }
    targetNode.conditionNodeKeys = targetNode.conditionNodes?.map(node => node.nodeKey)
    setFlowData(newData)
    events.onChange?.({
      action: 'ADD_BRANCH',
      flow: newData,
      addNodes: [newBranch],
      updateNodes: [targetNode],
    })
    events.afterAddBranch?.({ targetNode })
  }, [events, setFlowData, typeConfig])

  /**
   * 删除分支
   * @param targetNode 需要删除的节点 [bug]
   */
  const onDeleteBranch = useCallback(({ targetBranchKey }: {
    targetBranchKey: string
  }) => {
    const { newData, flowMap } = getNewFlowData(flowDataRef.current)
    const targetBranch = flowMap[targetBranchKey]
    events.beforeDeleteBranch?.({ targetBranch })
    if (!flowMap || !targetBranch.preNodeKey) return
    const previousNode = flowMap[targetBranch.preNodeKey]
    if (previousNode.conditionNodes?.length && previousNode.conditionNodes?.length > 2) {
      previousNode.conditionNodes = previousNode.conditionNodes?.filter((item) => item.nodeKey !== targetBranch.nodeKey)
      previousNode.conditionNodeKeys = previousNode.conditionNodes.map(node => node.nodeKey)
      // 分支大于2 ok 
      events.onChange?.({
        action: 'DELETE_BRANCH',
        flow: newData,
        deleteNodes: [...findAllNodesFormLL(targetBranch)],
        updateNodes: [previousNode],
      })
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
      // 另一条分支
      const reservedCondition = previousNode.conditionNodes?.find((item) => item.nodeKey !== targetBranch.nodeKey)
      const reservedBranch = reservedCondition?.nextNode

      if (reservedBranch) {
        // 存在保留分支
        const reservedLastNode = findLastNodeFormLL(reservedBranch)
        if (reservedLastNode?.nodeKey) {
          reservedBranch.preNodeKey = pNode?.nodeKey
          pNode.nextNode = reservedBranch
          reservedLastNode.nextNode = targetNode.nextNode
        } else {
          pNode.nextNode = undefined
        }
        // 分支等于2 ok 
        events.onChange?.({
          action: 'DELETE_BRANCH',
          flow: newData,
          // 删除的整条分支，分支父节点，保留分支的条件节点
          deleteNodes: [targetNode, ...findAllNodesFormLL(targetBranch), reservedCondition],
          updateNodes: [pNode, reservedBranch, reservedLastNode, reservedLastNode.nextNode!].filter(node => node),
        })
      } else {
        // 不存在保留分支
        if (targetNode.nextNode?.nodeKey) {
          targetNode.nextNode.preNodeKey = pNode?.nodeKey
          pNode.nextNode = targetNode.nextNode
        } else {
          pNode.nextNode = undefined
        }
        // 分支等于2 ok
        events.onChange?.({
          action: 'DELETE_BRANCH',
          flow: newData,
          deleteNodes: [targetNode, ...findAllNodesFormLL(targetBranch), reservedCondition!],
          updateNodes: [pNode, pNode.nextNode!].filter(node => node),
        })
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
      events.onChange?.({
        action: 'UPDATE_NODE',
        flow: newData,
        updateNodes: [currentNode],
      })
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
      events.onChange?.({ action: 'FORWARD', flow: history[index + 1] })
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
      events.onChange?.({ action: 'REVOKE', flow: history[index - 1] })
    }
  }, [flowData, history])

  /**
   * 改变分支顺序
   */
  const changeBranchIndex = useCallback((params: {
    targetNode: LinkedList
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
    nextNode.conditionNodeKeys = nextNode.conditionNodes.map(node => node.nodeKey)
    events.onChange?.({ action: 'CHANGE_BRANCH_INDEX', node: nextNode, flow: newData })
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

export { FlowContext, FlowProvider }
