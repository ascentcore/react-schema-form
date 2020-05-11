import React from 'react'
import schema from './basic-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export function BasicSchemaExample() {

    function onValid(data) {
        console.log(data)
    }

    const data = {
        firstName: 'test'
    }

    return (<SchemaForm schema={schema} onValid={onValid} data={data} />)

}

export const BasicSchemaExampleJson = schema
export const BasicSchemaExampleCode = `
import React from 'react'
import schema from './basic-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export function BasicSchema() {

    function onValid(data) {
        console.log(data)
    }

    const data = {
        firstName: 'test'
    }

    return (<SchemaForm schema={schema} onValid={onValid} data={data} />)

}
`