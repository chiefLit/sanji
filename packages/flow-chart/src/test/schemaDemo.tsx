import { RenderTypeEnum, TypeConfigData } from "../types";
import { convertSchemaNodes2LinkedList, SchemaNode } from "../utils/schema";
import FlowChart from '../index'

export const mockflow: SchemaNode = {
  "key": "SaveSaleTradeContractService",
  "type": "Service",
  "name": "销售交易合同Service",
  // "desc": "销售交易合同流程",
  "props": {
    "schemaVersion": 1,
    "transactionPropagation": "REQUIRED|REQUIRES_NEW|NOT_SUPPORTED",
  },
  "headNodeKeys": ["startKey"],
  "children": [

    // 开始节点
    {
      "type": "Start",
      "key": "startKey",
      "name": "开始节点",
      // "desc": "开始节点",
      "props": {
        "input": {}
      },
      "nextNodeKey": "CreateDataKey"
    },

    // 新增数据节点
    {
      "type": "Normal",
      "key": "CreateDataKey",
      "name": "保存数据节点",
      // "desc":"保存数据节点",
      "props": {
        "dataModel": "Order",
        "inputMapping": {}
      },
      "nextNodeKey": "ExclusiveBranchKey"
    },

    // 排他分支节点
    {
      "key": "ExclusiveBranchKey",
      "type": "Exclusive",
      "name": "排他分支节点",
      // "desc": "排他分支节点",
      "headNodeKeys": ["ConditionNode1", "ConditionNode2"],
      "nextNodeKey": "RpcServiceNodeKey",
      "children": [
        // 条件节点1
        {
          "type": "Condition",
          "key": "ConditionNode1",
          "name": "分支1",
          "props": {
            "condition": {}
          },
          "nextNodeKey": "looKey"
        },

        // 条件节点2
        {
          "type": "Condition",
          "key": "ConditionNode2",
          "name": "分支2",
          "props": {
            "condition": {}
          },
          "nextNodeKey": "DeleteDataKey"
        },

        // 删除数据节点
        {
          "type": "Normal",
          "key": "DeleteDataKey",
          // "desc":"删除数据节点",
          "name": "删除数据节点",
          "props": {
            "dataModel": "Order",
            "conditon": {}
          }
        },

        // 循环节点
        {
          "type": "Loop",
          "key": "looKey",
          "name": "循环节点",
          // "desc": "循环节点",
          "props": {
            "loopData": "",
            "loopItem": ""
          },
          "headNodeKeys": ["UpdateDataKey"],
          "children": [
            // 更新数据节点
            {
              "type": "Normal",
              "key": "UpdateDataKey",
              "name": "更新数据节点",
              // "desc":"更新数据节点",
              "props": {
                "dataModel": "Order",
                "inputMapping": {},
                "conditon": {}
              },
              "nextNodeKey": "QueryDataKey"
            },
            // 查询数据节点
            {
              "type": "Normal",
              "key": "QueryDataKey",
              "name": "查询数据节点",
              // "desc":"查询数据节点",
              "props": {
                "dataModel": "Order",
                "conditon": {}
              },
              "nextNodeKey": "BreakLoopKey"
            },
            // 跳出循环节点
            {
              "type": "Normal",
              "key": "BreakLoopKey",
              "name": 'end',
              "props": {
                "conditon": {}
              }
            }
          ]
        }
      ]
    },

    // rpc服务
    {
      "type": "Normal",
      "key": "RpcServiceNodeKey",
      "name": "保存订单",
      // "desc": "Rpc服务节点",
      "props": {
        "type": "nacos",
        "serviceName": "order-runtime",
        "serviceApi": "/api/erp/createOrder",
        "inputMapping": {},
        "output": {}
      },
      "nextNodeKey": "CallServiceKey"
    },

    // 调用服务
    {
      "type": "Normal",
      "key": "CallServiceKey",
      "name": "保存销售合同服务",
      // "desc": "调用服务节点",
      "props": {
        "calledService": "app.orderModule.SaveSaleTradeContractService",
        "inputMapping": {},
        "output": {}
      },
      "nextNodeKey": "EndKey"
    },

    // 结束节点
    {
      "type": "End",
      "key": "EndKey",
      "name": 'end',
      "props": {
        "outputMapping": {}
      }
    }
  ]
}

const typeConfig: TypeConfigData = {
  Start: {
    nodeTitle: '开始',
    renderType: RenderTypeEnum.Start,
  },
  End: {
    nodeTitle: '结束',
    renderType: RenderTypeEnum.End,
  },
  Normal: {
    nodeTitle: '一般',
    renderType: RenderTypeEnum.Normal,
  },
  Loop: {
    nodeTitle: '循环',
    renderType: RenderTypeEnum.Loop,
    nodeType: 'Loop',
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
}

export default function schemaDemo() {
  const linkedList = convertSchemaNodes2LinkedList({
    nodes: mockflow.children || [],
    typeConfig,
    nodeKey: mockflow.headNodeKeys?.[0]!
  })
  return (
    linkedList
      ? <FlowChart
        value={linkedList}
        onChange={(value) => {
          console.log(`onChange `, value)
        }}
        typeConfig={typeConfig}
      />
      : null
  )
}