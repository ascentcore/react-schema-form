import React, { useEffect, useState } from 'react'
import schema from './ajax-call-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

const generateResults = (startingChars) => {
    const results = []
    const characters = ' abcdefghijklmnopqrstuvwxyz'
    const resultsLength = Math.ceil(Math.random() * 10)
    for (let i = 0; i < resultsLength; i++) {
        let result = startingChars || ''
        const charactersLength = Math.ceil(Math.random() * 10)
        for (let j = 0; j < charactersLength; j++) {
            result += characters.charAt(Math.ceil(Math.random() * charactersLength))
        }
        results.push(result)
    }

    return results
}

function CustomSelectField({ value, onChange }) {
    const [options, setOptions] = useState([])
    const [loading, setLoading] = useState(false)
    const [displayResults, setDisplayResults] = useState(false)
    let [resultsTimeout, setResultsTimeout] = useState(0)

    const simulateAjaxCall = (startingChars) => {
        return new Promise((resolve) => {
            setResultsTimeout(
                setTimeout(() => {
                    resolve(generateResults(startingChars))
                }, 1000)
            )
        })
    }

    const getOptions = (startingChars) => {
        if (loading && resultsTimeout) {
            clearTimeout(resultsTimeout)
        }
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
                <div className='results' id='results'>
                    {!loading ? (
                        options.map((opt, index) => (
                            <div
                                className='result'
                                key={index + opt}
                                onMouseDown={(e) => {
                                    onChange(opt)
                                    e.stopPropagation()
                                }}
                            >
                                {opt}
                            </div>
                        ))
                    ) : (
                        <div className='loader' />
                    )}
                </div>
            )}
        </span>
    )
}

export default function CustomAjaxCallSchemaExample() {
    function onSubmit(data, errors) {
        if (!errors || !errors.length) {
            console.log(data)
        }
    }

    const exceptions = {
        keys: {
            search: { component: CustomSelectField }
        }
    }

    return <SchemaForm schema={schema} onSubmit={onSubmit} config={{ exceptions: exceptions }} />
}
