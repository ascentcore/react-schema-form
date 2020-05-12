import React from 'react'
import schema from './custom-registry-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'
import { TextField } from '@material-ui/core'

export default function CustomRegistryExample() {
    function onValid(data) {
        console.log(data)
    }

    const data = {
        firstName: 'test'
    }

    const customRegistry = {
        string: TextField
    }

    return (
        <SchemaForm
            schema={schema}
            onValid={onValid}
            data={data}
            config={{ registry: customRegistry }}
        />
    )
}
