import React, { useState, ReactNode, useEffect } from 'react'
import FormElement, { SchemaProperty } from './components/form-element'
import { addProperties, getConditionals, isObject, Conditional } from './utils'
import UISchema from './ui-schema'
import ComponentRegistry, { RegistryKeys } from './component-registry'
import ElementWrapper from './element-wrapper'
import ajv, { RequiredParams } from 'ajv'
import formatErrors from './error-formatter'
const _ = require('lodash')

export const SchemaForm = ({
    schema,
    root = schema,
    wrapper = ElementWrapper,
    parentChange = null,
    data = {},
    config = null,
    onSubmit = () => {},
    errorFormatter = null,
    path = '',
    errors: parentErrors = null
}: {
    root?: SchemaProperty | null
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

    const [currentSchema, setCurrentSchema] = useState<SchemaProperty | null>(null)
    const [obj, setObj] = useState<{ data: any; childPath: null | string }>(
        Object.assign({}, { data, childPath: null })
    )
    const [keys, setKeys] = useState(Object.keys(schema.properties || {}))
    const [instance] = useState(() => (parentChange ? null : new UISchema(schema)))
    const [registry] = useState(
        () =>
            new ComponentRegistry(
                config && config.registry ? config.registry : {},
                wrapper,
                config && config.exceptions ? config.exceptions : { paths: {}, keys: {} }
            )
    )
    const [errors, setErrors] = useState<ajv.ErrorObject[]>([])
    const [conditionals] = useState<{ data: Conditional[]; lastEvaluations: string }>(() => {
        const data = getConditionals(schema)
        return { data, lastEvaluations: '' }
    })

    const removeObjPath = (path: string[], obj: any) => {
        const prop = path[0]
        if (path.length > 1) {
            prop && removeObjPath(path.slice(1), obj ? obj[prop] : null)
            if (prop && obj && obj[prop] && Object.keys(obj[prop]).length === 0) {
                delete obj[prop]
            }
        } else {
            if (obj && prop && obj[prop] != undefined) {
                delete obj[prop]
            }
        }
    }

    const removeProperties = (currentSchema: any, baseSchema: any, nestedPath: string) => {
        if (isObject(currentSchema) && isObject(baseSchema)) {
            if (currentSchema['$ref'] !== undefined) {
                const def = currentSchema['$ref'].substr(currentSchema['$ref'].lastIndexOf('/') + 1)
                addProperties(currentSchema, root!.definitions[def])
            }

            for (const key in baseSchema) {
                if (!currentSchema[key]) {
                    handleParentChange(key)(undefined, `${nestedPath}.${key}`, `${nestedPath}.${key}`)
                } else {
                    removeProperties(
                        currentSchema[key],
                        baseSchema[key],
                        key !== 'properties' ? `${nestedPath}.${key}` : nestedPath
                    )
                }
            }
        }
    }

    const removeData = (schema: any, currentData: any) => {
        if (isObject(schema) && isObject(currentData)) {
            if (schema['$ref'] !== undefined) {
                const def = schema['$ref'].substr(schema['$ref'].lastIndexOf('/') + 1)
                addProperties(schema, root!.definitions[def])
            }

            for (const key in currentData) {
                if (schema['properties'] && schema['properties'][key] === undefined) {
                    delete currentData[key]
                } else {
                    removeData(schema['properties'] && schema['properties'][key], currentData[key])
                    if (isObject(currentData[key]) && Object.keys(currentData[key]).length === 0) {
                        delete currentData[key]
                    }
                }
            }
        }
    }

    const checkConditionals = (actualSchema: SchemaProperty) => {
        if (conditionals.data.length) {
            let lastEvaluation = '',
                currentEvaluation

            const newSchema = _.cloneDeep(schema)
            let newData = _.cloneDeep(obj.data)

            let lastEvaluations = ''

            while (lastEvaluation !== currentEvaluation) {
                currentEvaluation = lastEvaluation
                lastEvaluation = ''
                conditionals.data.forEach((conditional: Conditional) => {
                    try {
                        const evalCondition = eval(conditional.compiled)(newData)
                        if (evalCondition) {
                            addProperties(newSchema, conditional.then)
                            newData = _.cloneDeep(obj.data)
                            removeData(newSchema, newData)
                            lastEvaluation += '1'
                        } else {
                            addProperties(newSchema, conditional.else || {})
                            newData = _.cloneDeep(obj.data)
                            removeData(newSchema, newData)
                            lastEvaluation += '2'
                        }
                    } catch (err) {
                        // property does not exist on data;
                        lastEvaluation += '0'
                    }
                })
                lastEvaluations += lastEvaluation
            }

            if (lastEvaluations !== conditionals.lastEvaluations) {
                removeProperties(newSchema, actualSchema, '')
                setCurrentSchema(newSchema)
                setKeys(Object.keys(newSchema.properties || {}))
                conditionals.lastEvaluations = lastEvaluations
            }
        }
    }

    const handleParentChange = (key: string) => (value: any, childPath: string | null, nestedPath?: string) => {
        if (nestedPath) {
            setObj((prevObj: any) => {
                const newObj = Object.assign({}, { ...prevObj })
                removeObjPath(nestedPath.substr(1).split('.'), newObj.data)
                return newObj
            })
        } else {
            setObj((prevObj: any) => {
                const newValue = Object.assign({ childPath }, { data: { ...prevObj.data, [key]: value } })
                if (
                    value === undefined ||
                    value === '' ||
                    (value && value.constructor === Array && value.length === 0)
                ) {
                    delete newValue.data[key]
                }
                return newValue
            })
        }
    }

    const handleSubmit = () => {
        const result = instance!.validate(obj.data)
        const errors: ajv.ErrorObject[] = result || !instance!.validator.errors ? [] : instance!.validator.errors

        errors.forEach((err, index, object) => {
            if (err.keyword === 'if') {
                object.splice(index, 1)
            } else if (err.params && (err.params as RequiredParams).missingProperty) {
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
        checkConditionals(currentSchema || schema)
        if (parentChange && obj.childPath) {
            parentChange(obj.data, obj.childPath)
        } else {
            setErrors(errors.filter((item: ajv.ErrorObject) => item.dataPath !== obj.childPath))
        }
    }, [obj])

    return (
        <span className='ra-schema-form'>
            {currentSchema &&
                keys.map((key) => {
                    const childPath = `${path}.${key}`
                    const prop = currentSchema.properties![key]
                    return (
                        <FormElement
                            root={root!}
                            key={key}
                            error={getErrors(childPath)}
                            errors={parentErrors || errors}
                            value={obj.data ? obj.data[key] : undefined}
                            schema={prop}
                            path={childPath}
                            parentSchema={currentSchema}
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
