import React from 'react'
import schema from './file-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function FileSchemaExample() {
    function onSubmit(data, errors) {
        if (!errors || !errors.length) {
            console.log(data)
        }
    }

    const data = {}

    return <SchemaForm schema={schema} onSubmit={onSubmit} data={data} />
}
