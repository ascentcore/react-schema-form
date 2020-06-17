import React from 'react'
import schema from './conditionals-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function ConditionalsSchemaExample() {
    function onSubmit(data, errors) {
        if (!errors || !errors.length) {
            console.log(data)
        }
    }

    const data = { account: { car: false, model: { year: 15 } } }

    return <SchemaForm schema={schema} onSubmit={onSubmit} data={data} />
}
