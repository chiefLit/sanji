import React from 'react'

interface StageContextProps {
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  positionX: number
  setPositionX: React.Dispatch<React.SetStateAction<number>>
  positionY: number
  setPositionY: React.Dispatch<React.SetStateAction<number>>
  center: [string, string]
  setCenter: React.Dispatch<React.SetStateAction<[string, string]>>
}

/**
 * 舞台相关的状态管理
 */
const StageContext = React.createContext({} as StageContextProps)

interface StageProviderProps {
  children: React.ReactNode
}

const StageProvider: React.FC<StageProviderProps> = (props) => {
  const { children } = props
  const [zoom, setZoom] = React.useState<number>(100)
  const [positionX, setPositionX] = React.useState<number>(0)
  const [positionY, setPositionY] = React.useState<number>(0)
  const [center, setCenter] = React.useState<[string, string]>(['50%', '50%'])

  const providerValue = React.useMemo(() => {
    return {
      zoom,
      setZoom,
      positionX,
      setPositionX,
      positionY,
      setPositionY,
      center,
      setCenter,
    }
  }, [zoom, positionX, positionY, center])

  return (
    <StageContext.Provider value={providerValue}>
      {children}
    </StageContext.Provider>
  )
}

export { StageContext, StageProvider }
