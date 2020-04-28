import React, { Fragment } from 'react'
import BasicSchema from './basic-schema'
import NestedSchema from './nested-schema'

import '@ascentcore/react-schema-form/dist/index.css'

const App = () => {
  return (
    <Fragment>
      <BasicSchema />
      <hr />
      <NestedSchema />
    </Fragment>)
}

export default App
