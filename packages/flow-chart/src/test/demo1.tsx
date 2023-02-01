import FlowChart, { convertMap2LinkedList } from '../index'
import { RenderTypeEnum, LinkedList, Node } from '../types'

export const mock1: LinkedList = {
  nodeKey: '1',
  nodeType: 'Normal',
  renderType: RenderTypeEnum.Normal,
  nextNode: {
    nodeKey: '2',
    nodeType: 'End',
    renderType: RenderTypeEnum.End,
    properties: {
      nodeTitle: '结束',
      nodeContent: '节点2',
    },
  },
  properties: {
    nodeTitle: '123',
    nodeContent: '节点1',
  },
}

const mock1map: Record<string, Node> = {
  start: {
    nodeKey: 'start',
    nodeType: 'Normal',
    renderType: RenderTypeEnum.Normal,
    nextNodeKey: 'end',
    properties: {
      nodeTitle: '123',
      nodeContent: '节点1',
    },
  },
  end: {
    nodeKey: 'end',
    nodeType: 'End',
    renderType: RenderTypeEnum.End,
    preNodeKey: 'start',
    properties: {
      nodeTitle: '结束',
      nodeContent: '节点2',
    },
  }
}

const typeConfig = {
  Normal: {
    nodeTitle: '一般',
    renderType: RenderTypeEnum.Normal,
  },
  Exclusive: {
    nodeTitle: '排他',
    renderType: RenderTypeEnum.Exclusive,
    nodeType: 'Exclusive',
    conditionNodeType: 'Condition',
    condition: {
      defaultPropertiesList: [
        {
          nodeTitle: '条件',
          propertiesType: 'Type1',
        },
        {
          nodeTitle: 'else',
          propertiesType: 'Type1',
        },
      ],
    },
  },
  Inclusive: {
    nodeTitle: '并行',
    renderType: RenderTypeEnum.Inclusive,
    nodeType: 'Inclusive',
    conditionNodeType: 'Condition',
    condition: {
      defaultPropertiesList: [
        {
          nodeTitle: '分支',
          propertiesType: 'Type1',
        },
        {
          nodeTitle: '分支',
          propertiesType: 'Type1',
        },
      ],
    },
  },
  Condition: {
    nodeTitle: '分支',
    renderType: RenderTypeEnum.Condition,
    propertiesType: 'Type1',
  },
  End: {
    nodeTitle: 'end不能被添加',
    renderType: RenderTypeEnum.End,
  },
}

export default function demo1() {
  const linkedList = convertMap2LinkedList(mock1map, 'start')
  return (
    <FlowChart
      value={linkedList}
      onChange={(value) => {
        console.log(`onChange `, value)
      }}
      typeConfig={typeConfig}
    />
  )
}
