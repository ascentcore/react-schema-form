import React, { Fragment } from 'react'
import BasicSchema from './basic-schema'
import NestedSchema from './nested-schema'

import '@ascentcore/react-schema-form/dist/index.css'
import Deps from './deps'
import CustomWrapper from './custom-wrapper'

const App = () => {
  return (
    <Fragment>
      <p>Deps</p>
      <Deps />
      <hr />
      <p>BasicSchema</p>
      <BasicSchema />
      <hr />
      <p>Custom Wrapper</p>
      <CustomWrapper />
      <hr />
      <p>Nested Schema</p>
      <NestedSchema />
    </Fragment>)
}

export default App
