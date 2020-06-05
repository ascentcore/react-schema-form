import React from 'react'
import schema from './error-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function BasicSchemaExample() {

    function onValid(data) {
        console.log(data)
    }

    const data = {
        min1: 0,
        max10: 11,
        exclusiveMin1: 0,
        exclusiveMax10: 11,
        minLength: '',
        pattern: 'wrong',
        maxLength: 'maxlengthexceeded',
        minItems: ['a'],
        unique: ['a', 'a']
    }

    return (<SchemaForm schema={schema} onValid={onValid} data={data} />)

}