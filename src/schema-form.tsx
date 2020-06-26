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
}

const getConditionals = (schema: SchemaProperty) => {
    let ifEntries = []
    const simpleConditional = getSimpleConditional(schema)
    if (simpleConditional) {
        ifEntries.push(simpleConditional)
    }
    ifEntries = ifEntries.concat(getMultipleConditionals(schema))
    return ifEntries.map((ifEntry) => getCompiledConditional(ifEntry))
}

const getSimpleConditional = (schema: SchemaProperty) => {
    if (schema.if && schema.if.properties) {
        return {
            if: Object.entries(schema.if!.properties!) as { '0': string; '1': SchemaProperty }[],
            then: schema.then,
            else: schema.else
        }
    } else {
        return null
    }
}

const extractConditional = (
    conditionalSet: SchemaProperty[]
): {
    if: { '0': string; '1': SchemaProperty }[]
    then: SchemaProperty | undefined
    else: SchemaProperty | undefined
}[] => {
    return conditionalSet
        .filter((entry) => entry.if !== undefined)
        .map((conditional) => {
            return {
                if: Object.entries(conditional.if!.properties!) as { '0': string; '1': SchemaProperty }[],
                then: conditional.then,
                else: conditional.else
            }
        })
}

const getMultipleConditionals = (schema: SchemaProperty) => {
    let multipleConditionals: {
        if: { '0': string; '1': SchemaProperty }[]
        then: SchemaProperty | undefined
        else: SchemaProperty | undefined
    }[] = []
    if (schema.allOf) {
        multipleConditionals = multipleConditionals.concat(extractConditional(schema.allOf))
    }
    if (schema.anyOf) {
        multipleConditionals = multipleConditionals.concat(extractConditional(schema.anyOf))
    }
    if (schema.oneOf) {
        multipleConditionals = multipleConditionals.concat(extractConditional(schema.oneOf))
    }
    return multipleConditionals
}

const getCompiledConditional = (ifEntry: {
    if: { '0': string; '1': SchemaProperty }[]
    then: SchemaProperty | undefined
    else: SchemaProperty | undefined
}) => {
    const compiled: string = `data => { return ${ifEntry.if
        .reduce((memo: string[], item: { '0': string; '1': SchemaProperty }) => {
            return memo.concat([
                '(' +
                    'data' +
                    '.' +
                    item[0] +
                    '==' +
                    'undefined' +
                    ' || ' +
                    'data' +
                    '.' +
                    item[0] +
                    '==' +
                    (typeof item[1].const === 'string' ? "'" + item[1].const + "'" : item[1].const) +
                    ')'
            ])
        }, [])
        .join(' && ')} }`
    return {
        compiled: compiled,
        ...(ifEntry.then ? { then: ifEntry.then } : {}),
        ...(ifEntry.else ? { else: ifEntry.else } : {})
    }
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
        return getConditionals(schema)
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
            for (const key in baseSchema) {
                if (!currentSchema[key]) {
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

    const checkConditionals = (actualSchema: SchemaProperty) => {
        const newSchema = _.cloneDeep(schema)

        conditionals.forEach((conditional: Conditional) => {
            try {
                const evalCondition = eval(conditional.compiled)(obj.data)
                if (evalCondition) {
                    addProperties(newSchema, conditional.then)
                } else {
                    addProperties(newSchema, conditional.else || {})
                }
            } catch (err) {
                // property does not exist on data; enetring else branch
                addProperties(newSchema, conditional.then)
            }
        })
        removeProperties(newSchema, actualSchema, path)

        setCurrentSchema(newSchema)
        setKeys(Object.keys(newSchema.properties || {}))
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
