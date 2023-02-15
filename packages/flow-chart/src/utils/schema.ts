import { LinkedList, RenderTypeEnum, TypeConfigData } from "../types"

/**
 * 元数据
 */
export type SchemaNode = {
  key: string
  type: string
  name: string
  props?: Record<string, Object>
  children?: SchemaNode[]
  headNodeKeys?: string[]
  nextNodeKey?: string
}

/**
 * 转换节点类型至渲染类型
 * @param nodeType 
 * @returns RenderType
 */
export const getRenderTypeFormNodeType = (nodeType: string) => {
  const typeMap: Record<string, RenderTypeEnum> = {
    start: RenderTypeEnum.Start,
    end: RenderTypeEnum.End,
    normal: RenderTypeEnum.Normal,
    exclusive: RenderTypeEnum.Exclusive,
    inclusive: RenderTypeEnum.Inclusive,
    condition: RenderTypeEnum.Condition,
    loop: RenderTypeEnum.Loop,
  }
  return typeMap[nodeType]
}

/**
 * 流程节点元数据转换成链表结构
 * This is a TypeScript function that takes an array of schema nodes and recursively converts them into a linked list of nodes. 
 * The function starts with a specified node key and creates a linked list node based on the corresponding schema node. 
 * The function then checks for any child nodes, such as in the case of a loop or condition node, and recursively converts those nodes as well. 
 * The resulting linked list node is returned.
 * If the specified node key does not exist in the array of schema nodes, an error is logged and the function returns undefined.
 * @param flow 
 * @returns node
 */
export const convertSchemaNodes2LinkedList = (props: {
  nodes: SchemaNode[];
  typeConfig: TypeConfigData;
  nodeKey: string;
  preNodeKey?: string;
}) => {
  const { nodes, nodeKey, typeConfig, preNodeKey } = props
  const schemaNode = nodes.find(node => node.key === nodeKey)
  if (!schemaNode) {
    console.error(`${nodes} 节点列表中不存在节点 ${nodeKey}`)
    return
  }
  const renderType = typeConfig[schemaNode.type].renderType
  const node: LinkedList = {
    nodeKey: schemaNode.key,
    nodeType: schemaNode.type,
    renderType: renderType || RenderTypeEnum.Normal,
    preNodeKey,
    nextNodeKey: schemaNode.nextNodeKey,
    properties: { ...schemaNode.props, name: schemaNode.name }
  }
  if (node && node?.nextNodeKey) {
    node.nextNode = convertSchemaNodes2LinkedList({
      nodes, typeConfig,
      nodeKey: node?.nextNodeKey,
      preNodeKey: node.nodeKey
    })
  }
  if (node.renderType === RenderTypeEnum.Loop && schemaNode.children) {
    const loopNode = convertSchemaNodes2LinkedList({
      nodes: schemaNode.children,
      typeConfig,
      nodeKey: schemaNode.headNodeKeys?.[0]!,
      preNodeKey: node.preNodeKey
    })
    node.loopNode = loopNode
  }
  if (
    (node.renderType === RenderTypeEnum.Exclusive || node.renderType === RenderTypeEnum.Inclusive)
    && schemaNode.children && schemaNode.headNodeKeys
  ) {
    const conditionNodes = schemaNode.headNodeKeys?.map(conditionKey => {
      const branchNode = convertSchemaNodes2LinkedList({
        nodes: schemaNode.children || [],
        typeConfig,
        nodeKey: conditionKey,
        preNodeKey: node.preNodeKey
      })
      return branchNode
    })
    node.conditionNodes = conditionNodes.filter(item => item !== undefined) as LinkedList[]
  }
  return node
}

/**
 * 流程链表结构转换成节点元数据
 * This is a TypeScript function that takes a linked list of nodes and converts them into an array of schema nodes. 
 * The schema nodes include information about each linked list node's key, type, name, next node key, and properties. 
 * If the linked list node has child nodes, such as in the case of a loop or condition node, 
 * the function recursively converts those nodes as well and includes them in the schema node's children property. 
 * The resulting array of schema nodes is returned.
 * @param node 
 * @returns schemaNodes
 */
export const convertLinkedList2SchemaNodes = (node: LinkedList): SchemaNode[] => {
  let schemaNodes: SchemaNode[] = []
  const schemaNode: SchemaNode = {
    key: node.nodeKey,
    type: node.nodeType,
    name: node.properties.name,
    nextNodeKey: node.nextNodeKey,
    props: node.properties
  }
  if (node.renderType === RenderTypeEnum.Loop && node.loopNode) {
    schemaNode.children = convertLinkedList2SchemaNodes(node.loopNode)
    schemaNode.headNodeKeys = [node.loopNode.nodeKey]
  }
  if (
    (node.renderType === RenderTypeEnum.Exclusive || node.renderType === RenderTypeEnum.Inclusive)
    && node.conditionNodes) {
    const conditions = node.conditionNodes.map(conditionNode => convertLinkedList2SchemaNodes(conditionNode))
    schemaNode.children = conditions.flat()
    schemaNode.headNodeKeys = node.conditionNodes.map(item => item.nodeKey)
  }
  schemaNodes = [schemaNode]
  if (node.nextNode) {
    schemaNodes = [...schemaNodes, ...convertLinkedList2SchemaNodes(node.nextNode)]
  }
  return schemaNodes
}