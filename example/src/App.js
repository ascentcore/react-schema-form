/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Fragment, useState } from 'react'
import { BasicSchemaExample, BasicSchemaExampleJson, BasicSchemaExampleCode } from './basic-schema'
import { NestedSchemaExample, NestedSchemaExampleJson, NestedSchemaExampleCode } from './nested-schema'
import { CustomWrapperExample, CustomWrapperExampleJson, CustomWrapperExampleCode } from './custom-wrapper'
import './css/spectre.min.css'
import './css/spectre-icons.min.css'

import ReactJson from 'react-json-view'

const App = () => {

  const [selected, setSelected] = useState(parseInt(window.location.hash.substr(1)) || 0)
  const tabs = [
    {
      title: 'Basic Example',
      component: <BasicSchemaExample />,
      code: BasicSchemaExampleCode,
      schema: BasicSchemaExampleJson
    },
    {
      title: 'Nested Schema',
      component: <NestedSchemaExample />,
      code: NestedSchemaExampleCode,
      schema: NestedSchemaExampleJson
    },
    {
      title: 'Custom Wrapper',
      component: <CustomWrapperExample />,
      code: NestedSchemaExampleCode,
      schema: NestedSchemaExampleJson
    }
  ]

  const handleTabChange = (idx) => () => {
    setSelected(idx)

  }

  return (
    <div className="container">
      <div className="columns">
        <div className="column col-3">
          <ul className="nav">
            {tabs.map((tab, index) => <li key={index} className={`nav-item ${index === selected ? 'active' : ''}`} onClick={handleTabChange(index)}>
              <a href={`#${index}`}>{tab.title}</a>
            </li>)}
          </ul >
        </div>
        <div className="column col-9">
          <div className="card">
            <div className="card-header">
              <div className="card-title h5">{tabs[selected].title}</div>
              <div className="card-subtitle text-gray">Generated Form</div>
            </div>
            <div className="card-body">
              {tabs[selected].component}
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h4>Code</h4>
              <pre className="code" data-lang="JS">
                <code>
                  {tabs[selected].code}
                </code>
              </pre>
              <h4>Schema</h4>
              <ReactJson src={tabs[selected].schema} />
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default App
