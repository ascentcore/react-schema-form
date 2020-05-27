import React from 'react'
import schema from './file-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function FileSchemaExample() {

    function onValid(data) {
        console.log(data)
    }

    const data = {
    }

    return (<SchemaForm schema={schema} onValid={onValid} data={data} />)

}