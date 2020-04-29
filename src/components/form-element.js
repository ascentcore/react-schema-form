import React, { Fragment, useState, useEffect } from 'react'
import { SchemaForm } from '../schema-form'
import TextElement from './text-element'
import NumericElement from './numeric-element'
import SelectElement from './select-element'
import CheckboxElement from './checkbox-element'

export default function FormElement({
    root,
    property,
    path,
    value,
    errors,
    handleParentChange
}) {
    const [error] = useState(errors ? errors[path] : false)
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
        let value = evt
        if (evt.target) {
            value = evt.target.value
        }
        handleParentChange(value, path)
    }

    function getComponent(itemValue) {
        const props = {
            property,
            value: itemValue,
            onChange: handleChange
        }

        if (property.enum || property.options) {
            return <SelectElement {...props} />
        }
        switch (property.type) {
            case 'boolean':
                return <CheckboxElement {...props} />
            case 'number':
            case 'integer':
                return <NumericElement {...props} />
            default:
                return <TextElement {...props} />
        }
    }

    function renderItem(itemValue, index = null) {
        if (nest) {
            const pathKey = index === null ? path : `${path}[${index}]`
            return (
                <SchemaForm
                    path={pathKey}
                    schema={nest}
                    data={itemValue}
                    errors={errors}
                    parentChange={(subVal, key) => {
                        if (index !== null) {
                            const copy = [...value]
                            copy[index] = subVal
                            handleParentChange(copy, key)
                        } else {
                            handleParentChange(subVal, key)
                        }
                    }}
                />
            )
        } else {
            return (
                <Fragment>
                    <label>{property.title}</label>
                    {getComponent(itemValue)}
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
