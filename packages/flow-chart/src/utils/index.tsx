import { LinkedList, Node, RenderTypeEnum } from "../types"

let times = 0
export const getUniqId = (type?: string) => {
  times += 1
  if (type) {
    return `${type}${Date.now().toString(36)}${times}`
  }
  return `${Date.now().toString(36)}${times}`
}

export const isBranch = (renderType: string) => {
  return renderType === RenderTypeEnum.Exclusive || renderType === RenderTypeEnum.Inclusive
}

/**
 * Map转LinkedList
 * @param mapData 
 * @param flowKey 
 * @returns 
 */
export function convertMap2LinkedList(mapData: Record<string, Node>, flowKey: string) {
  const startNode: LinkedList = mapData[flowKey]
  if (startNode?.nextNodeKey) {
    startNode.nextNode = convertMap2LinkedList(mapData, startNode.nextNodeKey)
  }
  if (startNode.conditionNodeKeys && startNode.conditionNodeKeys.length) {
    startNode.conditionNodes = startNode.conditionNodeKeys.map(key => {
      return convertMap2LinkedList(mapData, key)
    })
  }

  return startNode
}

/**
 * LinkedList转Map
 * @param data
 * @returns
 */
export const convertLinkedList2Map = (data: LinkedList) => {
  const result: Record<string, LinkedList> = {}
  result[data.nodeKey] = Object.assign(data)
  if (data?.nextNode) {
    Object.assign(result, convertLinkedList2Map(data?.nextNode))
  }
  if (data?.conditionNodes) {
    data?.conditionNodes.forEach((node) => {
      Object.assign(result, convertLinkedList2Map(node))
    })
  }
  return result
}

/**
 * 寻找当前链表中最后一位
 * @param node 
 * @returns 
 */
export const findLastNodeFormLL = (node: LinkedList): LinkedList => {
  return node?.nextNode ? findLastNodeFormLL(node?.nextNode) : node
}

/**
 * 寻找当前链表中所有节点（包括自己）
 * @param node 
 * @returns 
 */
export const findAllNodesFormLL = (node: LinkedList) => {
  const result: LinkedList[] = []
  result.push(node)
  if (node.nextNode) {
    result.push(...findAllNodesFormLL(node.nextNode))
  }
  if (node.conditionNodes) {
    node.conditionNodes.forEach(item => {
      result.push(...findAllNodesFormLL(item))
    })
  }
  return result
}