import React, { useEffect, useState } from 'react'

export default function SelectElement({ property, value, onChange }) {
    const [options, setOptions] = useState([])
    let [labelKey, valueKey] = [
        property.labelKey || 'labelKey',
        property.valueKey || 'valueKey'
    ]
    useEffect(() => {
        let opts = property.options
        if (property.enum) {
            opts = property.enum.map((item) => ({
                labelKey: item,
                valueKey: item
            }))
        } else {
            labelKey = property.labelKey || labelKey
            valueKey = property.valueKey || valueKey
        }
        setOptions(opts)
    }, [property])

    return (
        <select onChange={onChange} value={value} defaultValue=''>
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
