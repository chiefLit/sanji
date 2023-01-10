import React from 'react'
import { Input, InputRef } from 'antd'
import { FlowContext } from '../../context'
import './style.less'

interface EditableTitleProps {
  /**
   * 标题
   */
  title?: string
  /**
   * 存在此属性，则会开启title可编辑模式。编辑失焦或回车后执行改回调函数。
   */
  onTitleChange?: (title: string) => void
  /**
   * className
   */
  className?: string
  maxLength?: number
  style?: React.CSSProperties
  /**
   * 是否可编辑
   */
  disabled?: boolean
}

/**
 * 可编辑的title标题
 * @param props
 * @returns
 */
const EditableTitle: React.FC<EditableTitleProps> = (props) => {
  const { onTitleChange, title, className, style, disabled, maxLength } = props
  const [headerTitle, setHeaderTitle] = React.useState<string | undefined>(
    title,
  )
  const [editable, setEditable] = React.useState(false)
  const { prefixCls } = React.useContext(FlowContext)
  const divRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleTextClick: EventListener = (e) => {
      e.stopPropagation()
      if (!disabled) setEditable(true)
    }
    const evt: EventListener = (e) => e.stopPropagation()
    if (editable) {
      divRef.current?.addEventListener('click', handleTextClick)
      divRef.current?.addEventListener('mousedown', evt)
      return
    }
    divRef.current?.addEventListener('click', handleTextClick)
    divRef.current?.addEventListener('mousedown', evt)
  }, [editable])

  React.useEffect(() => setHeaderTitle(title), [title])
  const inputRef = React.useRef<InputRef>(null)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderTitle(e.target.value)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    if (title !== e.target.value) {
      setHeaderTitle(e.target.value || title)
      onTitleChange?.(e.target.value || (title as string))
    }
    setEditable(false)
  }

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (title !== e.currentTarget.value) {
      setHeaderTitle(e.currentTarget.value || title)
      onTitleChange?.(e.currentTarget.value || (title as string))
    }
    inputRef.current?.blur()
  }

  const pageTitle = (
    <div className={`${prefixCls}-edittitle-box`} style={{ ...style }}>
      {editable ? (
        <Input
          ref={inputRef}
          className={`${prefixCls}-edittitle-titleinput ${className}`}
          value={headerTitle}
          onChange={handleChange}
          onPressEnter={handlePressEnter}
          onBlur={handleBlur}
          autoFocus={true}
          maxLength={maxLength}
        />
      ) : (
        <div
          className={`${prefixCls}-edittitle-titlediv ${className}`}
          ref={divRef}
        >
          {title}
        </div>
      )}
    </div>
  )
  return pageTitle
}

export { EditableTitle }
export type { EditableTitleProps }
