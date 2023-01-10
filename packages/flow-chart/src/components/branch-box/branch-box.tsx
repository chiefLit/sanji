import React, { useMemo } from 'react'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { FlowTableData } from '../../types'
import { NodeBox } from '../node-box/node-box'
import { AddNodeButton } from '../add-node-button/add-node-button'
import { AddBranchButton } from './add-branch-button'
import { FlowContext } from '../../context'
import './style.less'

interface BranchBoxProps {
  data: FlowTableData
}

const BranchBox: React.FC<BranchBoxProps> = (props) => {
  const { data } = props
  const { prefixCls, changeBranchIndex, readonly, typeConfig } = React.useContext(FlowContext)

  const hideAddButton = useMemo(() => {
    const conditionNodeType = typeConfig[data.nodeType]?.conditionNodeType
    return conditionNodeType && typeConfig[conditionNodeType]?.condition?.hideAddBranch
  }, [data, typeConfig])

  const hideIndex = useMemo(() => {
    const conditionNodeType = typeConfig[data.nodeType]?.conditionNodeType
    return conditionNodeType && typeConfig[conditionNodeType]?.condition?.hideIndex
  }, [data, typeConfig])

  const event = {
    moveLeft: (index: number) => {
      changeBranchIndex?.({
        targetNode: data,
        fromIndex: index,
        toIndex: index - 1,
      })
    },
    moveRight: (index: number) => {
      changeBranchIndex?.({
        targetNode: data,
        fromIndex: index,
        toIndex: index + 1,
      })
    },
  }

  return (
    <div className={`${prefixCls}-branch-box-wrapper`}>
      <div className={`${prefixCls}-branch-box-content`}>
        {data.conditionNodes?.map((item, index) => {
          return (
            <div className={`${prefixCls}-row-box`} key={item.nodeKey}>
              {/* 分支可操作索引 */}
              {!hideIndex && (
                <div className={`${prefixCls}-branch-index`}>
                  {!readonly && index !== 0 && (
                    <div
                      className={`${prefixCls}-branch-left-btn ${prefixCls}-branch-btn`}
                      onClick={() => event.moveLeft(index)}
                    >
                      <LeftOutlined size={10} color="#0073FF" />
                    </div>
                  )}
                  <span>{index + 1}</span>
                  {/* eslint-disable-next-line no-unsafe-optional-chaining */}
                  {!readonly && index !== data.conditionNodes?.length! - 1 && (
                    <div
                      className={`${prefixCls}-branch-right-btn ${prefixCls}-branch-btn`}
                      onClick={() => event.moveRight(index)}
                    >
                      <RightOutlined size={10} color="#0073FF" />
                    </div>
                  )}
                </div>
              )}
              <NodeBox data={item} />
              <div className={`${prefixCls}-center-line`} />
            </div>
          )
        })}
      </div>
      {!readonly && !hideAddButton && <AddBranchButton data={data} />}
      <AddNodeButton data={data} />
    </div>
  )
}

export { BranchBox }
