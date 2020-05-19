import React from 'react'
import schema from './nested-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function NestedSchemaExample() {
    function onValid(data) {
        console.log(data)
    }

    const data = {
        field: {
            name: 'field'
        },
        fields: [{ name: 'item1' }, { name: 'item2' }]
    }

    return <SchemaForm schema={schema} onValid={onValid} data={data} />
}
