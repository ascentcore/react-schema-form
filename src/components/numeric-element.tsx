import React, { FormEvent } from 'react'
import { SchemaProperty } from './form-element'

interface NumericElementProperties {
    property: SchemaProperty
    value: string
    onChange: (value: number) => void
}

export default function NumericElement({
    property,
    value,
    onChange
}: NumericElementProperties) {
    const handleChange = (event: FormEvent<HTMLInputElement>) => {
        const { type } = property
        const { value } = (event.target as HTMLInputElement)
        if (type === 'integer') {
            onChange(parseInt(value))
        } else {
            onChange(parseFloat(value))
        }
    }

    return <input type='number' value={value} onChange={handleChange} />
}
