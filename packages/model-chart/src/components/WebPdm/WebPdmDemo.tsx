import React from 'react'
import WebPdm from 'web-pdm'
import ModelTest from './mock/model-test'
import ModuleTest from './mock/module-test'
// import "../test/style.less"
import './style.less'
import 'antd/dist/antd.css'

const WebPdmDemo = () => {
  return (
    <WebPdm
      models={ModelTest}
      modules={ModuleTest}
      erdkey='codedemo'
      height='850'
      className='console-g6-page-dumi'
    />
  )
}

export { WebPdmDemo }