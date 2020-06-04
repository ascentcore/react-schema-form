import React, { useEffect, useState } from 'react'
import schema from './ajax-call-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

const simulateAjaxCall = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(['1', '2', '3', '4', '5'])
        }, 1000)
    })
}

function CustomSelectField({ value, onChange }) {
    const [options, setOptions] = useState([])
    useEffect(() => {
        simulateAjaxCall().then((response) => {
            setOptions(response)
        })
    }, [])
    const handleChange = (event) => {
        onChange(event.target.value)
    }
    return (
        <select onChange={handleChange} value={value} defaultValue=''>
            <option value='' disabled>
                Select your option
            </option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    )
}

function CustomMultipleSelectField({ value, onChange }) {
    const [options, setOptions] = useState([])
    useEffect(() => {
        simulateAjaxCall().then((response) => {
            setOptions(response)
        })
    }, [])
    const handleChange = (event) => {
        const options = event.target.options
        const value = []
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value)
            }
        }
        onChange(value)
    }
    return (
        <select onChange={handleChange} value={value || []} multiple={true}>
            <option value='' disabled>
                Select your option
            </option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    )
}

export default function CustomAjaxCallSchemaExample() {
    function onValid(data) {
        console.log(data)
    }

    const exceptions = {
        keys: {
            option: { component: CustomSelectField },
            multipleOption: { component: CustomMultipleSelectField }
        }
    }

    return <SchemaForm schema={schema} onValid={onValid} config={{ exceptions: exceptions }} />
}
