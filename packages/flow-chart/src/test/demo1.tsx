import FlowChart from '../index'
import { RenderTypeEnum, FlowTableData } from '../types'

export const mock1: FlowTableData = {
  nodeKey: '1',
  nodeType: 'type1',
  renderType: RenderTypeEnum.Normal,
  nextNode: {
    nodeKey: '2',
    nodeType: 'type4',
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

const typeConfig = {
  Type1: {
    nodeTitle: '节点1',
    renderType: RenderTypeEnum.Normal,
  },
  Type2: {
    nodeTitle: '节点2',
    renderType: RenderTypeEnum.Condition,
    conditionNodeType: 'condition',
  },
  condition: {
    nodeTitle: 'condition',
    renderType: RenderTypeEnum.Normal,
    condition: {
      conditionDefaultProperties: {
        nodeTitle: '分支',
        propertiesType: 'Type1',
      },
      defaultPropertiesList: [
        {
          nodeTitle: '分支',
          propertiesType: 'Type1',
        },
        {
          nodeTitle: 'else',
          propertiesType: 'Type1',
        },
      ],
    },
  },
  Type3: {
    nodeTitle: '节点3',
    renderType: RenderTypeEnum.Interflow,
  },
  Type4: {
    nodeTitle: 'end不能被添加',
    renderType: RenderTypeEnum.End,
  },
}

export default function demo1() {
  return (
    <FlowChart
      value={mock1}
      onChange={(value) => {
        console.log(`onChange `, value)
      }}
      typeConfig={typeConfig}
    />
  )
}
