import React, { useState, ReactNode, useEffect } from 'react'
import FormElement, { SchemaProperty } from './components/form-element'
import UISchema from './ui-schema'
import ComponentRegistry, { RegistryKeys } from './component-registry'
import ElementWrapper from './element-wrapper'
import ajv, { RequiredParams } from 'ajv'
import formatErrors from './error-formatter'
const _ = require('lodash')

interface Conditional {
    compiled: string
    then?: SchemaProperty
    else?: SchemaProperty
    lastState: boolean | null
}

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
    const [conditionals] = useState<Conditional[]>((): Conditional[] => {
        if (schema && schema.if && schema.if.properties) {
            const ifEntries = Object.entries(schema.if!.properties!) as { '0': string; '1': SchemaProperty }[]
            if (ifEntries) {
                const compiled: string = `data => { return ${ifEntries
                    .reduce((memo: string[], item: { '0': string; '1': SchemaProperty }) => {
                        return memo.concat([
                            'data' +
                                '.' +
                                item[0] +
                                '==' +
                                (typeof item[1].const === 'string' ? "'" + item[1].const + "'" : item[1].const)
                        ])
                    }, [])
                    .join(' && ')} }`
                return [
                    {
                        compiled: compiled,
                        ...(schema.then ? { then: schema.then } : {}),
                        ...(schema.else ? { else: schema.else } : {}),
                        lastState: null
                    }
                ]
            }
        }
        return []
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

    const removeProperties = (currentSchema: any, baseSchema: any, nestedPath: string): any => {
        if (isObject(currentSchema) && isObject(baseSchema)) {
            for (const key in currentSchema) {
                if (!baseSchema[key]) {
                    delete currentSchema[key]
                    handleParentChange(key)(undefined, obj.childPath, `${nestedPath}.${key}`)
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

    const updateSchema = (currentSchema: any, baseSchema: any, newProperties: any): any => {
        const newSchema = _.cloneDeep(currentSchema)
        removeProperties(newSchema, baseSchema, path)
        addProperties(newSchema, newProperties)
        setCurrentSchema(newSchema)
        setKeys(Object.keys(newSchema.properties || {}))
    }

    const checkConditionals = (actualSchema: SchemaProperty) => {
        conditionals.forEach((conditional: Conditional) => {
            try {
                const evalCondition = eval(conditional.compiled)(obj.data)
                if (evalCondition !== conditional.lastState) {
                    if (evalCondition) {
                        conditional.lastState = true
                        updateSchema(actualSchema, schema, conditional.then)
                    } else {
                        conditional.lastState = false
                        updateSchema(actualSchema, schema, conditional.else || {})
                    }
                }
            } catch (err) {
                // property does not exist on data; enetring else branch
                if (!conditional.lastState || conditional.lastState === null) {
                    conditional.lastState = true
                    updateSchema(actualSchema, schema, conditional.then || {})
                }
            }
        })
    }

    const handleParentChange = (key: string) => (value: any, childPath: string | null, nestedPath?: string) => {
        if (nestedPath) {
            setObj((prevObj: any) => {
                const newObj = Object.assign({}, { ...prevObj })
                removeObjPath(nestedPath.substr(1).split('.').slice(1), newObj.data)
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
