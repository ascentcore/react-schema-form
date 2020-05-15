import React, { FormEvent } from 'react'
import { SchemaProperty } from './form-element'

interface NumericElementProperties {
    property: SchemaProperty
    value: string
    onChange: (value: number | string) => void
}

function isNumeric(value: string) {
    return !isNaN(parseInt(value)) || !isNaN(parseFloat(value))
}

export default function NumericElement({
    property,
    value,
    onChange
}: NumericElementProperties) {
    const handleChange = (event: FormEvent<HTMLInputElement>) => {
        const { type } = property
        const { value } = event.target as HTMLInputElement
        if (isNumeric(value)) {
            if (type === 'integer') {
                onChange(parseInt(value))
            } else {
                onChange(parseFloat(value))
            }
        } else {
            onChange('')
        }
    }

    return (
        <input
            type='number'
            value={value !== undefined ? value : ''}
            onChange={handleChange}
        />
    )
}
