import React, { Fragment, useState, useEffect } from 'react'
import { SchemaForm } from './schema-form'

export default function FormElement({
    root,
    property,
    path,
    value,
    errors,
    handleParentChange
}) {
    const [error, setError] = useState(errors ? errors[path] : false)
    const [nest, setNest] = useState(null)

    useEffect(() => {
        function processRef($ref) {
            const def = $ref.substr($ref.lastIndexOf('/') + 1)
            return root.definitions[def]
        }

        let { $ref, items } = property

        if (items) {
            $ref = items.$ref
        }

        if ($ref) {
            setNest(processRef($ref))
        }
    }, [property])

    const handleChange = (evt) => {
        const { type } = property
        let { value } = evt.target

        if (type === 'integer') {
            value = parseInt(value)
        }

        setError(false)
        handleParentChange(value)
    }

    function renderItem(itemValue, index = null) {
        if (nest) {
            return (
                <SchemaForm
                    path={index === null ? path : `${path}[${index}]`}
                    schema={nest}
                    data={itemValue}
                    errors={errors}
                    parentChange={(subVal) => {
                        if (index !== null) {
                            const copy = [...value]
                            copy[index] = subVal
                            handleParentChange(copy)
                        } else {
                            handleParentChange(subVal)
                        }
                    }}
                />
            )
        } else {
            return (
                <Fragment>
                    <label>{property.title}</label>
                    <input
                        type='text'
                        value={itemValue}
                        onChange={handleChange}
                    />
                    {error}
                </Fragment>
            )
        }
    }
    if (Array.isArray(value)) {
        return (
            <Fragment>
                {value.map((item, index) => (
                    <Fragment key={`${path}-${index}`}>
                        {renderItem(item, index)}
                    </Fragment>
                ))}
                <button
                    onClick={() => {
                        handleParentChange([...value, { name: 'test' }])
                    }}
                >
                    add item
                </button>
            </Fragment>
        )
    } else {
        return renderItem(value)
    }
}
