import React from 'react'
import ReactDOM from 'react-dom/client'
import Demo1 from './test/demo1'
import SchemaDemo from './test/schemaDemo'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SchemaDemo />
  </React.StrictMode>,
)
