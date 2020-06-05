import React from 'react'
import schema from './schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'


export default function Options() {

    function onValid(data) {
        console.log(data)
    }

    const data = {}

    schema.properties.type.options = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
        { key: 'key4', value: 'value4' }
    ]
    schema.properties.type.labelKey = 'key'
    schema.properties.type.valueKey = 'value'

    return (<SchemaForm schema={schema} onValid={onValid} data={data} />)

}