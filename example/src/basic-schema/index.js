import React from 'react'
import schema from './basic-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function BasicSchemaExample() {
    function onSubmit(data, errors) {
        if (!errors || !errors.length) {
            console.log(data)
        }
    }

    const data = {
        firstName: 'test',
        hobbies: ['singing', 'drawing']
    }

    return <SchemaForm schema={schema} onSubmit={onSubmit} data={data} />
}
