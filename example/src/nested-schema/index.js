import React from 'react'
import schema from './nested-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function NestedSchemaExample() {
    function onSubmit(data, errors) {
        if (!errors || !errors.length) {
            console.log(data)
        }
    }

    const data = {
        field: {
            field1: 'field1'
        },
        fields: [{ name: 'item1' }, { name: 'item2' }]
    }

    return <SchemaForm schema={schema} onSubmit={onSubmit} data={data} />
}
