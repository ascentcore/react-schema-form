import React, { useEffect, useState } from 'react'
import schema from './ajax-call-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

const simulateAjaxCall = (startingChars) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(generateResults(startingChars))
        }, 1000)
    })
}

const generateResults = (startingChars) => {
    const results = []
    const characters = ' abcdefghijklmnopqrstuvwxyz'
    const resultsLength = Math.floor(Math.random() * 10)
    for (let i = 0; i < resultsLength; i++) {
        let result = startingChars || ''
        const charactersLength = Math.floor(Math.random() * 10)
        for (let j = 0; j < charactersLength; j++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        results.push(result)
    }

    return results
}

function CustomSelectField({ value, onChange }) {
    const [options, setOptions] = useState([])
    const [loading, setLoading] = useState(false)
    const [displayResults, setDisplayResults] = useState(false)

    const getOptions = (startingChars) => {
        setLoading(true)
        simulateAjaxCall(startingChars).then((response) => {
            setOptions(response)
            setLoading(false)
        })
    }

    useEffect(() => {
        getOptions('')
    }, [])
    const handleChange = (event) => {
        onChange(event.target.value)
        getOptions(event.target.value)
    }
    return (
        <span className='custom-select-field'>
            <input
                onChange={handleChange}
                value={value || ''}
                onFocus={() => {
                    setDisplayResults(true)
                }}
                onBlur={() => {
                    setDisplayResults(false)
                }}
            />
            {displayResults && (
                <div className='results'>
                    {!loading ? options.map((opt) => <div key={opt}>{opt}</div>) : <div class='loader' />}
                </div>
            )}
        </span>
    )
}

export default function CustomAjaxCallSchemaExample() {
    function onValid(data) {
        console.log(data)
    }

    const exceptions = {
        keys: {
            search: { component: CustomSelectField }
        }
    }

    return <SchemaForm schema={schema} onValid={onValid} config={{ exceptions: exceptions }} />
}
