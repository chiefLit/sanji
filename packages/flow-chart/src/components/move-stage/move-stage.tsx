import React, { useContext, useEffect, useRef, useState } from 'react'
import { FlowContext } from '../../context'
import { getUniqId } from '../../utils'
import { StageContext } from './context'
import './style.less'

interface MoveStageProps {
  children: React.ReactNode
}

const MoveStage: React.FC<MoveStageProps> = (props) => {
  const { children } = props
  const [outerId] = useState(getUniqId())
  const { positionX, setPositionX, positionY, setPositionY, center, zoom } = useContext(StageContext)
  const { prefixCls } = useContext(FlowContext)
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const clickLockRef = useRef(false)

  useEffect(() => {
    const outerDom = outerRef.current
    if (!outerDom) return undefined
    outerDom.addEventListener('wheel', events.bindWheel, { passive: false })
    outerDom.addEventListener('mousedown', events.bindMouseDown(outerDom))
    outerDom.addEventListener('mouseup', events.bindMouseUp(outerDom))
    outerDom.addEventListener('mouseleave', events.bindMouseUp(outerDom))
    outerDom.addEventListener('click', events.bindClick, true)

    return () => {
      outerDom.removeEventListener('wheel', events.bindWheel)
      outerDom.removeEventListener('mousedown', events.bindMouseDown(outerDom))
      outerDom.removeEventListener('mouseup', events.bindMouseUp(outerDom))
      outerDom.removeEventListener('mouseleave', events.bindMouseUp(outerDom))
      outerDom.removeEventListener('click', events.bindClick, true)
    }
  }, [])

  const events = {
    // 临时记录场景定位[mouseup或者mouseleave时才会更新move变化]
    scenePositionX: 0,
    scenePositionY: 0,
    // mousedown定位
    mouseDownPositionX: 0,
    mouseDownPositionY: 0,

    bindWheel: (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      // 还有一个神奇的判断判断是双指缩放还是移动
      const t = (e as any).wheelDeltaY
        ? (e as any).wheelDeltaY === -3 * e.deltaY
        : e.deltaMode === 0
      if (t) {
        // 计算方式：获取滚动时每一个step的delta值（左下为负值）去定位scene的position
        const { left = '', top = '' } = innerRef.current?.style! ?? {}
        events.scenePositionX -= e.deltaX
        events.scenePositionY -= e.deltaY
        const positionX = Number(left?.slice(0, left.length - 2))
        const positionY = Number(top?.slice(0, top.length - 2))
        const scenePositionX = positionX - e.deltaX
        const scenePositionY = positionY - e.deltaY
        setPositionX(scenePositionX)
        setPositionY(scenePositionY)
      } else {
        // 效果不理想
        // return
        // if (
        //   (e.deltaY >= 0 && zoom < 50)
        //   || (e.deltaY < 0 && zoom > 200)
        // ) return
        // const next = e.deltaY < 0 ? (zoom + 10) : (zoom - 10)
        // setZoom(next)
      }
    },

    bindClick: (e: MouseEvent) => {
      if (clickLockRef.current) {
        e.stopImmediatePropagation()
      }
    },

    bindMouseDown: (outerDom: HTMLElement) => (e: MouseEvent) => {
      events.mouseDownPositionX = e.x
      events.mouseDownPositionY = e.y
      outerDom?.addEventListener(
        'mousemove',
        events.bindMouseMove as EventListenerOrEventListenerObject,
        false,
      )
    },

    bindMouseMove: (e: MouseEvent) => {
      // 这是过程的delta，并非想wheel事件中按每个step来的，所以一次性操作，mouseup时再去记录。
      const deltaX = events.mouseDownPositionX - e.x
      const deltaY = events.mouseDownPositionY - e.y
      const scenePositionX = events.scenePositionX - deltaX
      const scenePositionY = events.scenePositionY - deltaY
      if (deltaX > 2 || deltaY > 2 || deltaY < -2 || deltaX < -2) {
        clickLockRef.current = true
      }
      setPositionX(scenePositionX)
      setPositionY(scenePositionY)
    },

    bindMouseUp: (outerDom: HTMLElement) => () => {
      const { left = '', top = '' } = innerRef.current?.style! ?? {}
      events.scenePositionX = Number(left?.slice(0, left.length - 2))
      events.scenePositionY = Number(top?.slice(0, top.length - 2))
      outerDom?.removeEventListener(
        'mousemove',
        events.bindMouseMove as EventListenerOrEventListenerObject,
      )
      setTimeout(() => {
        clickLockRef.current = false
      }, 0)
    },
  }

  return (
    // 占满整屏
    <div className={`${prefixCls}-stage-outer`} ref={outerRef} id={outerId}>
      {/* 为了居中 */}
      <div className={`${prefixCls}-stage-for-center-top`}>
        {/* 拖动单元 */}
        <div
          className={`${prefixCls}-stage-inner`}
          style={{
            position: 'absolute',
            transform: `translate(-50%, 64px) scale(${zoom / 100})`,
            transformOrigin: `${center[0]}px ${center[1]}px`,
            left: `${positionX}px`,
            top: `${positionY}px`,
          }}
          ref={innerRef}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export { MoveStage }
