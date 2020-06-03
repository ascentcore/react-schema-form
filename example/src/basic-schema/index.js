import React from 'react'
import schema from './basic-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function BasicSchemaExample() {

    function onValid(data) {
        console.log(data)
    }

    const data = {
        firstName: 'test',
        hobbies: ['singing', 'drawing']
    }

    return (<SchemaForm schema={schema} onValid={onValid} data={data} />)

}