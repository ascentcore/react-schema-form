import React from 'react'
import schema from './custom-registry-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'
import { TextField } from '@material-ui/core'

function CustomWrapper({ children }) {
    return <div className='column col-4'>{children}</div>
}

function CustomTextField({ property, value, onChange }) {
    return (
        <TextField
            value={value}
            onChange={onChange}
            error={!!property.error}
            label={property.title}
            helperText={property.error ? property.error[0].keyword : ' '}
            required={property.isRequired}
        />
    )
}

export default function CustomRegistryExample() {
    function onValid(data) {
        console.log(data)
    }

    const data = {
        firstName: 'test'
    }

    const customRegistry = {
        string: { component: CustomTextField, wrapper: CustomWrapper }
    }

    return (
        <SchemaForm
            schema={schema}
            onValid={onValid}
            data={data}
            config={{ registry: customRegistry }}
        />
    )
}
