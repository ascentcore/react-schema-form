import React, { FormEvent, useEffect, useState } from 'react'
import { SchemaProperty } from './form-element'

interface MultipleSelectElementProperties {
    property: SchemaProperty
    value: string[]
    onChange: (value: string[]) => void
}

export default function MultipleSelectElement({ property, value, onChange }: MultipleSelectElementProperties) {
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
        const options = (event.target as HTMLSelectElement).options
        const value = []
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value)
            }
        }
        onChange(value)
    }

    return (
        <select multiple={true} onChange={handleChange} value={value || []}>
            <option value='' disabled>
                Select your options
            </option>
            {options.map((opt) => (
                <option key={opt[labelKey]} value={opt[valueKey]}>
                    {opt[labelKey]}
                </option>
            ))}
        </select>
    )
}
