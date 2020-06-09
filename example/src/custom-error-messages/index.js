import React from 'react'
import schema from './error-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function BasicSchemaExample() {
    function onSubmit(data, errors) {
        if (!errors || !errors.length) {
            console.log(data)
        }
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

    const formatError = (err) => {
        err.message = `Keyword: ${err.keyword}`
        return err
    }

    return <SchemaForm schema={schema} onSubmit={onSubmit} data={data} errorFormatter={formatError} />
}
