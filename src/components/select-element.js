import React, { useEffect, useState } from 'react'

export default function SelectElement({ property, value, onChange }) {
    const [options, setOptions] = useState([])
    let [labelKey, valueKey] = [
        property.labelKey || 'labelKey',
        property.valueKey || 'valueKey'
    ]
    useEffect(() => {
        if (property.enum) {
            setOptions(
                property.enum.map((item) => ({
                    labelKey: item,
                    valueKey: item
                }))
            )
        } else {
            labelKey = property.labelKey || labelKey
            valueKey = property.valueKey || valueKey
            setOptions(property.options)
        }
    }, [property])
    return (
        <select onChange={onChange}>
            {options.map((opt) => (
                <option key={opt[labelKey]} value={opt[valueKey]}>
                    {opt[labelKey]}
                </option>
            ))}
        </select>
    )
}
