import React, { useState, ReactNode, useEffect } from 'react'
import FormElement, { SchemaProperty } from './components/form-element'
import UISchema from './ui-schema'
import ComponentRegistry, { RegistryKeys } from './component-registry'
import ElementWrapper from './element-wrapper'
import ajv, { RequiredParams } from 'ajv'
import formatErrors from './error-formatter'
const _ = require('lodash')

interface Conditional {
    const?: any
    then?: SchemaProperty
    else?: SchemaProperty
    lastCondition?: string
}

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

    const [currentSchema, setCurrentSchema] = useState<SchemaProperty>(() => _.cloneDeep(schema))
    const [obj, setObj] = useState<{ data: any; childPath: null | string }>(
        Object.assign({}, { data, childPath: null })
    )
    const [keys, setKeys] = useState(Object.keys(schema.properties || {}))
    const [instance] = useState(() => new UISchema(schema))
    const [registry] = useState(
        () =>
            new ComponentRegistry(
                config && config.registry ? config.registry : {},
                wrapper,
                config && config.exceptions ? config.exceptions : { paths: {}, keys: {} }
            )
    )
    const [errors, setErrors] = useState<ajv.ErrorObject[]>([])
    const [conditionals] = useState<{ [key: string]: Conditional }>(() => {
        if (schema && schema.if && schema.if.properties) {
            const ifEntry = Object.entries(schema.if!.properties!)[0]
            if (ifEntry && ifEntry[1].const) {
                return {
                    [ifEntry[0]]: {
                        const: ifEntry[1].const,
                        ...(schema.then ? { then: schema.then } : {}),
                        ...(schema.else ? { else: schema.else } : {}),
                        lastCondition: ''
                    }
                }
            }
        }
        return {}
    })

    const isObject = (item: any) => {
        return item && typeof item === 'object' && !Array.isArray(item)
    }

    const addProperties = (currentSchema: any, newProperties: any): any => {
        if (isObject(currentSchema) && isObject(newProperties)) {
            for (const key in newProperties) {
                if (isObject(newProperties[key])) {
                    if (!currentSchema[key]) {
                        Object.assign(currentSchema, { [key]: {} })
                    }
                    addProperties(currentSchema[key], newProperties[key])
                } else {
                    Object.assign(currentSchema, { [key]: newProperties[key] })
                }
            }
        }
    }

    const removeProperties = (currentSchema: any, baseSchema: any): any => {
        if (isObject(currentSchema) && isObject(baseSchema)) {
            for (const key in currentSchema) {
                if (!baseSchema[key]) {
                    delete currentSchema[key]
                    handleParentChange(key)(undefined, obj.childPath)
                } else {
                    removeProperties(currentSchema[key], baseSchema[key])
                }
            }
        }
    }

    const updateSchema = (currentSchema: any, baseSchema: any, newProperties: any): any => {
        const newSchema = _.cloneDeep(currentSchema)
        removeProperties(newSchema, baseSchema)
        addProperties(newSchema, newProperties)
        setCurrentSchema(newSchema)
    }

    const checkConditionals = (key: string, value: any) => {
        if (value === conditionals[key].const && conditionals[key].then && conditionals[key].lastCondition !== 'if') {
            conditionals[key].lastCondition = 'if'
            updateSchema(currentSchema, schema, conditionals[key].then)
            setKeys(Object.keys(currentSchema.properties || {}))
        }
        if (value !== conditionals[key].const && conditionals[key].lastCondition !== 'else') {
            conditionals[key].lastCondition = 'else'
            if (conditionals[key].else) {
                updateSchema(currentSchema, schema, conditionals[key].else)
                setKeys(Object.keys(currentSchema.properties || {}))
            } else {
                updateSchema(currentSchema, schema, {})
                setKeys(Object.keys(currentSchema.properties || {}))
            }
        }
    }

    const handleParentChange = (key: string) => (value: any, childPath: string | null) => {
        setObj((prevObj: any) => {
            const newValue = Object.assign({ childPath }, { data: { ...prevObj.data, [key]: value } })
            if (value === undefined || value === '' || (value && value.constructor === Array && value.length === 0)) {
                delete newValue.data[key]
            }
            return newValue
        })
        if (conditionals[key]) {
            checkConditionals(key, value)
        }
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
        setCurrentSchema(_.cloneDeep(schema))
        setKeys(Object.keys(schema.properties || {}))
    }, [schema])

    useEffect(() => {
        keys.forEach((key) => {
            if (conditionals[key] && obj.data[key]) {
                checkConditionals(key, obj.data[key])
            }
        })
    }, [])

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
                const prop = currentSchema.properties![key]
                return (
                    <FormElement
                        key={key}
                        error={getErrors(childPath)}
                        errors={parentErrors || errors}
                        value={obj.data ? obj.data[key] : undefined}
                        schema={prop}
                        path={childPath}
                        root={currentSchema}
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
