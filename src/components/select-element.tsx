import React, { FormEvent, useEffect, useState } from 'react'
import { SchemaProperty } from './form-element'

interface SelectElementProperties {
    property: SchemaProperty
    value: string
    onChange: (event: string) => void
}

export default function SelectElement({ property, value, onChange }: SelectElementProperties) {
    const [options, setOptions] = useState<{ [key: string]: string }[]>([])
    let [labelKey, valueKey] = [property.labelKey || 'labelKey', property.valueKey || 'valueKey']
    useEffect(() => {
        let opts = property.options
        if (property.enum) {
            opts = property.enum.map((item: string) => ({
                labelKey: item,
                valueKey: item
            }))
        } else {
            labelKey = property.labelKey || labelKey
            valueKey = property.valueKey || valueKey
        }
        opts && setOptions(opts)
    }, [property])

    const handleChange = (event: FormEvent<HTMLSelectElement>) => {
        onChange((event.target as HTMLInputElement).value)
    }

    return (
        <select onChange={handleChange} value={value !== undefined ? value : ''}>
            {!value && (
                <option value='' disabled>
                    Select your option
                </option>
            )}
            {options.map((opt) => (
                <option key={opt[labelKey]} value={opt[valueKey]}>
                    {opt[labelKey]}
                </option>
            ))}
        </select>
    )
}
