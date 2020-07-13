import React from 'react'
import schema from './dependencies-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function ConditionalsSchemaExample() {
    function onSubmit(data, errors) {
        if (!errors || !errors.length) {
            console.log(data)
        }
    }

    const data = { }

    return <SchemaForm schema={schema} onSubmit={onSubmit} data={data} />
}
