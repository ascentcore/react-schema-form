import React, { useState, ReactNode } from 'react'
import FormElement, { SchemaProperty } from './components/form-element'
import UISchema from './ui-schema'
import ComponentRegistry, { RegistryKeys } from './component-registry'
import ElementWrapper from './element-wrapper'
import ajv, { RequiredParams } from 'ajv'

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
    config?: {
        registry?: RegistryKeys
        exceptions?: {
            paths: RegistryKeys
            keys: RegistryKeys
        }
    } | null
    onValid?: (data: any) => void
    path?: string
    errors?: ajv.ErrorObject[] | null
}) => {
    if (!schema) {
        throw new Error('schema must be provided to the SchemaForm component')
    }

    const [obj, setObj] = useState(Object.assign({}, data))
    const [keys] = useState(Object.keys(schema.properties || {}))
    const [instance] = useState(new UISchema(schema))
    const [registry] = useState(
        new ComponentRegistry(
            config && config.registry ? config.registry : {},
            wrapper,
            config && config.exceptions ? config.exceptions : { paths: {}, keys: {} }
        )
    )
    const [errors, setErrors] = useState<ajv.ErrorObject[]>([])

    const handleParentChange = (key: string) => (value: any, childPath: string) => {
        const newValue = Object.assign({}, obj, { [key]: value })
        if (value === '' || value && value.constructor === Array && value.length === 0) {
            delete newValue[key]
        }
        setObj(newValue)

        if (parentChange) {
            parentChange(newValue, childPath)
        } else {
            setErrors(errors.filter((item: ajv.ErrorObject) => item.dataPath !== childPath))
        }
    }

    const handleSubmit = () => {
        const result = instance.validate(obj)
        const errors: ajv.ErrorObject[] = result || !instance.validator.errors ? [] : instance.validator.errors
        errors.forEach((err) => {
            if (err.params && (err.params as RequiredParams).missingProperty) {
                err.dataPath += `.${(err.params as RequiredParams).missingProperty}`
            }
        })
        setErrors(errors as ajv.ErrorObject[])

        if (result) {
            onValid(obj)
        }
    }

    const getErrors = (path: string) => {
        const errArr = [...errors, ...(parentErrors || [])]
        let result: ajv.ErrorObject[] | boolean = errArr.filter((err) => err.dataPath === path)

        if (result && result.length === 0) {
            result = false
        }

        return result
    }

    return (
        <span className='ra-schema-form'>
            {keys.map((key) => {
                const childPath = `${path}.${key}`
                const prop = schema.properties![key]
                return (
                    <FormElement
                        key={key}
                        error={getErrors(childPath)}
                        errors={parentErrors || errors}
                        value={obj ? obj[key] : undefined}
                        schema={prop}
                        path={childPath}
                        root={schema}
                        handleParentChange={handleParentChange(key)}
                        registry={registry}
                    />
                )
            })}
            {!parentChange &&
                registry.getComponent({ registryKey: 'button', className: 'ra-submit-button' }, 'Submit', handleSubmit)}
        </span>
    )
}
