import React, { FormEvent, useEffect, useState } from 'react'
import { SchemaProperty } from './form-element'

interface RadioElementProperties {
    property: SchemaProperty
    value: string
    onChange: (event: string) => void
}

export default function RadioElement({ property, value, onChange }: RadioElementProperties) {
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

    const handleChange = (event: FormEvent<HTMLInputElement>) => {
        onChange((event.target as HTMLInputElement).value)
    }
    return (
        <span>
            {options.map((opt) => (
                <div className='radio' key={opt[labelKey]}>
                    <label>
                        <input
                            type='radio'
                            value={opt[valueKey]}
                            checked={value === opt[valueKey]}
                            onChange={handleChange}
                        />
                        {` ${opt[valueKey]}`}
                    </label>
                </div>
            ))}
        </span>
    )
}
