import React, { Fragment, useState, ReactNode } from 'react'
import FormElement, { SchemaProperty } from './components/form-element'
import UISchema, { ValidatorError } from './ui-schema'
import ComponentRegistry from './component-registry'
import ElementWrapper from './element-wrapper'

export const SchemaForm = ({
    schema,
    wrapper = ElementWrapper,
    parentChange = null,
    data = {},
    config = null,
    onValid = () => {},
    path = '',
    errors: parentErrors = null
}: {
    schema?: SchemaProperty | null
    wrapper?: ReactNode
    parentChange?: ((subVal: any, key: string) => void) | null
    data?: any
    config?: {registry: ComponentRegistry} | null
    onValid?: (data: any) => void
    path?: string
    errors?: ValidatorError[] | null

}) => {
    if (!schema) {
        throw new Error('schema must be provided to the SchemaForm component')
    }

    const [obj, setObj] = useState(Object.assign({}, data))
    const [keys] = useState(Object.keys(schema.properties || {}))
    const [instance] = useState(new UISchema(schema))
    const [registry] = useState(
        new ComponentRegistry(config ? config.registry: {}, wrapper)
    )
    const [errors, setErrors] = useState<ValidatorError[]>([])

    const handleParentChange = (key: string) => (value: any, childPath: string) => {
        const newValue = Object.assign({}, obj, { [key]: value })
        setObj(newValue)

        if (parentChange) {
            parentChange(newValue, childPath)
        } else {
            setErrors(errors.filter((item: ValidatorError) => item.dataPath !== childPath))
        }
    }

    const handleSubmit = () => {
        const result = instance.validate(obj)
        const errors = result || ! instance.validator.errors ? [] : (instance.validator.errors as ValidatorError[])
        errors.forEach((err) => {
            if (err.params && err.params.missingProperty) {
                err.dataPath += `.${err.params.missingProperty}`
            }
        })
        setErrors(errors as ValidatorError[])

        if (result) {
            onValid(obj)
        }
    }

    const getErrors = (path: string) => {
        const errArr = [...errors, ...(parentErrors || [])]
        let result: ValidatorError[] | boolean = errArr.filter((err) => err.dataPath === path)

        if (result && result.length === 0) {
            result = false
        }

        return result
    }

    return (
        <Fragment>
            {keys.map((key) => {
                const childPath = `${path}.${key}`
                const prop = schema.properties![key]
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
