import React, { useState, ReactNode, useEffect } from 'react'
import FormElement, { SchemaProperty } from './components/form-element'
import UISchema from './ui-schema'
import ComponentRegistry, { RegistryKeys } from './component-registry'
import ElementWrapper from './element-wrapper'
import ajv, { RequiredParams } from 'ajv'
import formatErrors from './error-formatter'

export const SchemaForm = ({
    schema,
    wrapper = ElementWrapper,
    parentChange = null,
    data = {},
    config = null,
    onSubmit = () => {},
    errorFormatter = null,
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
            paths?: RegistryKeys
            keys?: RegistryKeys
        }
    } | null
    onSubmit?: (data: any, errors: ajv.ErrorObject[]) => void
    errorFormatter?: Function | null
    path?: string
    errors?: ajv.ErrorObject[] | null
}) => {
    if (!schema) {
        throw new Error('schema must be provided to the SchemaForm component')
    }

    const [obj, setObj] = useState<{data: any, childPath: null | string}>(Object.assign({}, { data, childPath: null }))
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
        setObj((prevObj: any) => {
            const newValue = Object.assign({ childPath }, { data: { ...prevObj.data, [key]: value } })
            if (value === '' || (value && value.constructor === Array && value.length === 0)) {
                delete newValue.data[key]
            }
            return newValue
        })
    }

    const handleSubmit = () => {
        const result = instance.validate(obj.data)
        const errors: ajv.ErrorObject[] = result || !instance.validator.errors ? [] : instance.validator.errors
        errors.forEach((err) => {
            if (err.params && (err.params as RequiredParams).missingProperty) {
                err.dataPath += `.${(err.params as RequiredParams).missingProperty}`
            }
        })

        const formattedErrors: ajv.ErrorObject[] = formatErrors(errors as ajv.ErrorObject[], errorFormatter)
        setErrors(formattedErrors)

        onSubmit(obj.data, formattedErrors)
    }

    const getErrors = (path: string) => {
        const errArr = [...errors, ...(parentErrors || [])]
        let result: ajv.ErrorObject[] | boolean = errArr.filter((err) => err.dataPath === path)

        if (result && result.length === 0) {
            result = false
        }

        return result
    }

    useEffect(() => {
        if (parentChange && obj.childPath) {
            parentChange(obj.data, obj.childPath)
        } else {
            setErrors(errors.filter((item: ajv.ErrorObject) => item.dataPath !== obj.childPath))
        }
    }, [obj])

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
                        value={obj.data ? obj.data[key] : undefined}
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
