import React, { Fragment } from 'react'
import BasicSchema from './basic-schema'
import NestedSchema from './nested-schema'

import '@ascentcore/react-schema-form/dist/index.css'
import Deps from './deps'

const App = () => {
  return (
    <Fragment>
      <Deps />
      <hr />
      <BasicSchema />
      <hr />
      <NestedSchema />
    </Fragment>)
}

export default App
