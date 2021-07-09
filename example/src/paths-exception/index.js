import React from 'react';
import schema from './path-exception-schema.json';
import { SchemaForm } from '@ascentcore/react-schema-form';
import { TextField } from '@material-ui/core';

function CustomTextField({ property, value, onChange }) {
    const handleChange = (event) => {
        onChange(event.target.value)
    }
    return (
        <TextField
            value={value || ''}
            onChange={handleChange}
            error={!!property.error}
            label={property.title}
            helperText={property.error ? property.error[0].keyword : ' '}
            required={property.isRequired}
        />
    )
}

export default function PathsExceptionExample() {
    function onSubmit(data, errors) {
        if (!errors || !errors.length) {
            console.log(data)
        }
    }

    const data = {
        name: {
            firstName: '',
            lastName: '',
        },
        age: 18,
    }

    const exceptions = {
        paths: {
            '.name.firstName': { component: CustomTextField },
            '.hobby': { component: CustomTextField },
        }
    }

    return <SchemaForm
        schema={schema}
        onSubmit={onSubmit}
        data={data}
        config={{ exceptions }}
    />
}