import React, { useMemo } from 'react'
import { Button, Divider } from 'antd'
import { MinusOutlined, PlusOutlined, ArrowLeftOutlined, ArrowRightOutlined, RedoOutlined } from '@ant-design/icons'
import { FlowContext } from '../../context'
import { StageContext } from '../move-stage/context'
import './style.less'

interface ToolbarProps { }

/**
 * 顶部工具栏
 * @returns
 */
const Toolbar: React.FC<ToolbarProps> = () => {
  // const [fullscreened, setFullscreened] = React.useState(false)
  const { zoom, setZoom, setPositionX, setPositionY } = React.useContext(StageContext)
  const { flowData, prefixCls, forward, revoke, renderToolbar, flowHistory, readonly } = React.useContext(FlowContext)

  React.useEffect(() => {
    const left = document.querySelector('#_toolbar_left')
    left?.addEventListener('mousedown', (e) => e.stopPropagation())
    left?.addEventListener('wheel', (e) => e.stopPropagation())
  }, [])

  const disabledRevoke = useMemo(
    () => flowHistory?.[0] === flowData,
    [flowData, flowHistory],
  )
  const disabledForward = useMemo(
    () => flowHistory?.[flowHistory.length - 1] === flowData,
    [flowData, flowHistory],
  )

  // if (renderToolbar) {
  //   return <>{renderToolbar(flowData, { forward, revoke })}</>
  // }

  const btns = {
    revoke: <Button
      className={`${prefixCls}-toolbar-btn`}
      icon={<ArrowLeftOutlined />}
      type="text"
      size="small"
      disabled={disabledRevoke}
      onClick={(e) => {
        e.stopPropagation()
        if (disabledRevoke) return
        revoke()
      }}
    />,

    forward: <Button
      className={`${prefixCls}-toolbar-btn`}
      icon={<ArrowRightOutlined />}
      type="text"
      size="small"
      disabled={disabledForward}
      onClick={(e) => {
        e.stopPropagation()
        if (disabledForward) return
        forward()
      }}
    />,
    zoomOut: <Button
      className={`${prefixCls}-toolbar-btn`}
      type="text"
      icon={<MinusOutlined />}
      size="small"
      disabled={zoom <= 50}
      onClick={(e) => {
        e.stopPropagation()
        setZoom(zoom - 10 < 50 ? 50 : zoom - 10)
      }}
    />,
    zoomIn: <Button
      className={`${prefixCls}-toolbar-btn`}
      type="text"
      icon={<PlusOutlined />}
      size="small"
      disabled={zoom >= 200}
      onClick={(e) => {
        e.stopPropagation()
        setZoom(zoom + 10 > 200 ? 200 : zoom + 10)
      }}
    />,
    reset: <Button
      className={`${prefixCls}-toolbar-btn`}
      type="text"
      icon={<RedoOutlined />}
      size="small"
      onClick={(e) => {
        e.stopPropagation()
        setZoom(100)
        setPositionX(0)
        setPositionY(0)
      }}
    />
  }

  return (
    <div className={`${prefixCls}-toolbar-wrapper`}>
      <div className={`${prefixCls}-toolbar-left`} id="_toolbar_left">
        {!readonly && (
          <>
            {btns.revoke}
            {btns.forward}
            <Divider type="vertical" />
          </>
        )}

        {btns.zoomOut}
        <div className={`${prefixCls}-toolbar-zoom`}>{Math.floor(zoom)}%</div>
        {btns.zoomIn}
        <Divider type="vertical" />
        {btns.reset}
        {renderToolbar?.(flowData, { forward, revoke })}
      </div>
      {/* <div className={`${prefixCls}-toolbar-right`}>
        <div
          className={`${prefixCls}-toolbar-item`}
          onClick={fullscreened ? exitFullscreen : launchFullscreen}
        >
          {fullscreened ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </div>
      </div> */}
    </div>
  )
}

export { Toolbar }
