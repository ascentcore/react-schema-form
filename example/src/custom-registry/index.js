import React, { useEffect, useState } from 'react'
import schema from './custom-registry-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'
import { TextField, Slider } from '@material-ui/core'

import addIcon from './add-icon.png'

function CustomWrapper({ children }) {
    return <div className='column col-12'>{children}</div>
}

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

function CustomAddButton({ property, onChange }) {
    return (
        <img
            className={property.className}
            onClick={onChange}
            src={addIcon}
            style={{ height: '15px' }}
            alt='add icon'
        />
    )
}

function CustomNumericField({ property, value, onChange }) {
    const handleChange = (event, newValue) => {
        onChange(newValue)
    }

    return (
        <Slider
            value={value !== undefined ? value : property.minimum ? property.minimum : 0}
            min={property.minimum ? property.minimum : 0}
            onChange={handleChange}
            valueLabelDisplay='auto'
        />
    )
}

function CustomLocation({ value }) {
    const [coordinates, setCoordinates] = useState({ latitude: 46.753731, longitude: 23.605707 })
    useEffect(() => {
        if (value && value.latitude && value.longitude) {
            setCoordinates({ latitude: value.latitude, longitude: value.longitude })
        }
    }, [])

    console.log(`https://maps.google.com/maps?q=${coordinates.latitude}, ${coordinates.longitude}&z=15&output=embed`)
    return (
        <iframe
            src={`https://maps.google.com/maps?q=${coordinates.latitude}, ${coordinates.longitude}&z=15&output=embed`}
            width='450'
            height='450'
        ></iframe>
    )
}

export default function CustomRegistryExample() {
    function onSubmit(data, errors) {
        if (!errors || !errors.length) {
            console.log(data)
        }
    }

    const data = {
        firstName: 'test',
        age: 18
    }

    const customRegistry = {
        string: { component: CustomTextField, wrapper: CustomWrapper },
        integer: { component: CustomNumericField, wrapper: CustomWrapper },
        enum: { component: 'RadioElement' },
        addButton: { component: CustomAddButton, wrapper: CustomWrapper }
    }

    const exceptions = {
        keys: {
            gender: { component: 'SelectElement' },
            location: { component: CustomLocation, wrapper: CustomWrapper }
        }
    }

    return (
        <SchemaForm
            schema={schema}
            onSubmit={onSubmit}
            data={data}
            config={{ registry: customRegistry, exceptions: exceptions }}
        />
    )
}
