import React, { Fragment, useState } from 'react'
import FormElement from './components/form-element'
import UISchema from './ui-schema.ts'
import ComponentRegistry from './component-registry'

export const SchemaForm = ({
    schema,
    wrapper,
    parentChange,
    data,
    config,
    onValid,
    path = '',
    errors: parentErrors
}) => {
    if (!schema) {
        throw new Error('schema must be provided to the SchemaForm component')
    }

    const [obj, setObj] = useState(Object.assign({}, data))
    const [keys] = useState(Object.keys(schema.properties))
    const [instance] = useState(new UISchema(schema))
    const [registry] = useState(
        new ComponentRegistry(config && config.registry, wrapper)
    )
    const [errors, setErrors] = useState([])

    const handleParentChange = (key) => (value, childPath) => {
        const newValue = Object.assign({}, obj, { [key]: value })
        setObj(newValue)

        if (parentChange) {
            parentChange(newValue, childPath)
        } else {
            setErrors(errors.filter((item) => item.dataPath !== childPath))
        }
    }

    const handleSubmit = (data) => {
        const result = instance.validate(obj)
        const errors = result ? [] : instance.validator.errors
        errors.forEach((err) => {
            if (err.params && err.params.missingProperty) {
                err.dataPath += `.${err.params.missingProperty}`
            }
        })
        setErrors(errors)

        if (result) {
            onValid(obj)
        }
    }

    const getErrors = (path) => {
        const errArr = [...errors, ...(parentErrors || [])]
        let result = errArr.filter((err) => err.dataPath === path)

        if (result && result.length === 0) {
            result = false
        }

        return result
    }

    return (
        <Fragment>
            {keys.map((key) => {
                const childPath = `${path}.${key}`
                const prop = schema.properties[key]
                return (
                    <FormElement
                        key={key}
                        error={getErrors(childPath)}
                        errors={parentErrors || errors}
                        value={obj ? obj[key] : undefined}
                        property={prop}
                        path={childPath}
                        root={schema}
                        handleParentChange={handleParentChange(key)}
                        registry={registry}
                    />
                )
            })}
            {!parentChange &&
                registry.getComponent(
                    { registryKey: 'button' },
                    'Submit',
                    handleSubmit
                )}
        </Fragment>
    )
}
