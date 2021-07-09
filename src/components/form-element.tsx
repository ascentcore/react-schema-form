import React, { Fragment, useState, useEffect, ReactNode } from 'react'
import { SchemaForm } from '../schema-form'
import { addProperties } from '../utils'
import ComponentRegistry from '../component-registry'
import { SCHEMA_KEYWORDS } from '../constants'
import ajv from 'ajv'
const _ = require('lodash')

export interface SchemaProperty {
    $ref?: string
    items?: SchemaProperty
    type?: string
    title?: string
    description?: string
    properties?: { [key: string]: SchemaProperty }
    required?: string[]
    enum?: string[]
    options?: { [key: string]: string }[]
    labelKey?: string
    valueKey?: string
    minimum?: number
    maximum?: number
    default?: any
    contentEncoding?: string
    contentMediaType?: string
    if?: any
    then?: any
    else?: any
    const?: any
    instanceof?: string
    definitions?: any
    allOf?: SchemaProperty[]
    anyOf?: SchemaProperty[]
    oneOf?: SchemaProperty[]
    dependencies?: {
        [key: string]: string[] | SchemaProperty
    }

    path?: string
    registryKey?: string
    error?: ajv.ErrorObject[] | boolean
    isRequired?: boolean
    className?: string
}

interface FormElementProperties {
    root: SchemaProperty
    parentSchema: any
    schema: SchemaProperty
    path: string
    value: any
    errors: ajv.ErrorObject[]
    error: ajv.ErrorObject[] | boolean
    handleParentChange: (value: any, childPath: string) => void
    registry: ComponentRegistry
}

export default function FormElement({
    root,
    parentSchema,
    schema,
    path,
    value,
    errors,
    error,
    handleParentChange,
    registry
}: FormElementProperties) {
    const [nestedSchema, setNestedSchema] = useState<SchemaProperty | null>(null)

    useEffect(() => {
        function processRef($ref: string) {
            const def = $ref.substr($ref.lastIndexOf('/') + 1)
            return root.definitions[def]
        }

        function initializeData() {
            if (value === undefined) {
                if (schema.default !== undefined) {
                    handleParentChange(schema.default, path)
                } else {
                    if (schema.type === SCHEMA_KEYWORDS.BOOLEAN) {
                        handleParentChange(false, path)
                    }
                }
            }
        }

        const { $ref, items, properties } = schema
        let newNestedSchema = null

        if (items) {
            if (items.$ref) {
                newNestedSchema = _.cloneDeep(processRef(items.$ref))
            } else if (items.properties) {
                newNestedSchema = _.cloneDeep(items)
            }
        } else {
            if ($ref) {
                newNestedSchema = _.cloneDeep(processRef($ref))
            }
            if (properties) {
                if (!$ref) {
                    newNestedSchema = _.cloneDeep(schema)
                }
                addProperties(newNestedSchema, {
                    properties: schema.properties,
                    required: schema.required ? schema.required : []
                })
            }
        }
        setNestedSchema(newNestedSchema)

        initializeData()
    }, [schema])

    const handleArrayElementRemoval = (index: number) => () => {
        const newVal = [...value]
        newVal.splice(index, 1)
        handleParentChange(newVal, path)
    }

    function renderNestedSchema(pathKey: string, itemValue: any, index: null | number) {
        return (
            <SchemaForm
                root={root}
                key={JSON.stringify(nestedSchema)}
                path={pathKey}
                config={{ registry: registry._registry, exceptions: registry._exceptions }}
                schema={nestedSchema}
                data={itemValue}
                errors={errors}
                parentChange={(subVal: any, key: string) => {
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
    }

    function renderPrimitiveArrayItem(itemValue: any, itemProperty: SchemaProperty, index: number) {
        const registryKey =
            itemProperty.enum || itemProperty.options
                ? SCHEMA_KEYWORDS.ENUM
                : itemProperty.contentEncoding || itemProperty.contentMediaType
                ? SCHEMA_KEYWORDS.FILE
                : itemProperty.type
        const pathKey = `${path}[${index}]`

        let arrayElementErrors: ajv.ErrorObject[] | boolean = errors.filter((err) => err.dataPath === pathKey)
        if (arrayElementErrors && arrayElementErrors.length === 0) {
            arrayElementErrors = false
        }

        return registry.getComponent(
            {
                ...itemProperty,
                path: pathKey,
                registryKey,
                error: arrayElementErrors,
                type: registryKey
            },
            itemValue,
            (changedItemValue: string | number | boolean) => {
                const copy = [...value]
                copy[index] = changedItemValue
                handleParentChange(copy, path)
            },
            null
        )
    }

    function renderArrayOfEnums(itemValue: any, itemProperty: SchemaProperty) {
        const key = path.substr(path.lastIndexOf('.') + 1)
        const isRequired = parentSchema.required && parentSchema.required.indexOf(key) > -1

        return registry.getComponent(
            {
                enum: itemProperty.enum,
                path,
                registryKey: SCHEMA_KEYWORDS.MULTIPLE_ENUM,
                error,
                isRequired,
                title: schema.title,
                type: SCHEMA_KEYWORDS.ENUM
            },
            itemValue,
            (changedItemValue: string | number | boolean) => handleParentChange(changedItemValue, path),
            null
        )
    }

    function renderArray(itemValue: any) {
        return (
            <Fragment>
                {itemValue &&
                    itemValue.map((item: any, index: number) => (
                        <Fragment key={`${path}-${itemValue.length}-${index}`}>
                            {renderFormElement(item, index)}
                            {registry.getComponent(
                                {
                                    registryKey: SCHEMA_KEYWORDS.REMOVE_BUTTON,
                                    className: 'ra-remove-button'
                                },
                                'Remove item',
                                handleArrayElementRemoval(index)
                            )}
                        </Fragment>
                    ))}
                {registry.getComponent(
                    { registryKey: SCHEMA_KEYWORDS.ADD_BUTTON, className: 'ra-add-button' },
                    'Add item',
                    () => {
                        let emptyChild = {}
                        if (!nestedSchema && schema.items && schema.items.type) {
                            switch (schema.items.type) {
                                case SCHEMA_KEYWORDS.INTEGER:
                                case SCHEMA_KEYWORDS.NUMBER:
                                    emptyChild = typeof schema.items.minimum === 'number' ? schema.items.minimum : 0
                                    break
                                case SCHEMA_KEYWORDS.BOOLEAN:
                                    emptyChild = false
                                    break
                                default:
                                    emptyChild = ''
                            }
                        }
                        handleParentChange([...(itemValue || []), emptyChild], path)
                    }
                )}
            </Fragment>
        )
    }

    function getElementFromRegistry(itemValue: any, children: ReactNode | null = null, title?: string, type?: string) {
        const registryKey =
            schema.enum || schema.options
                ? SCHEMA_KEYWORDS.ENUM
                : schema.contentEncoding || schema.contentMediaType || schema.instanceof === SCHEMA_KEYWORDS.FILE
                ? SCHEMA_KEYWORDS.FILE
                : schema.type
        const key = path.substr(path.lastIndexOf('.') + 1)
        const isRequired = parentSchema.required && parentSchema.required.indexOf(key) > -1

        return registry.getComponent(
            {
                ...schema,
                path,
                registryKey,
                error,
                isRequired,
                title: title || schema.title,
                type: type || schema.type,
                contentMediaType:
                    schema.instanceof === SCHEMA_KEYWORDS.FILE
                        ? schema.properties!.content.contentMediaType
                        : schema.contentMediaType
            },
            itemValue,
            (changedItemValue: string | number | boolean) => handleParentChange(changedItemValue, path),
            children
        )
    }

    function renderFormElement(itemValue: any, index: number | null = null) {
        const typeObjectArrayItem = !!nestedSchema && schema.type === SCHEMA_KEYWORDS.ARRAY && index !== null
        const typeObjectOrObjectArrayItem =
            (!!nestedSchema && schema.type !== SCHEMA_KEYWORDS.ARRAY) || typeObjectArrayItem

        const typePrimitiveArrayItem =
            !nestedSchema &&
            schema.type === SCHEMA_KEYWORDS.ARRAY &&
            index !== null &&
            !!schema.items &&
            !!schema.items.type

        const typeArray = schema.type === SCHEMA_KEYWORDS.ARRAY && index === null
        const typeArrayOfEnums =
            schema.type === SCHEMA_KEYWORDS.ARRAY &&
            index === null &&
            schema.items &&
            schema.items.type === SCHEMA_KEYWORDS.STRING &&
            schema.items.enum !== undefined

        if (typeObjectOrObjectArrayItem) {
            const pathKey = index === null ? path : `${path}[${index}]`

            return getElementFromRegistry(
                itemValue,
                renderNestedSchema(pathKey, itemValue, index),
                nestedSchema!.title,
                typeObjectArrayItem ? nestedSchema!.type : schema.type
            )
        } else if (typePrimitiveArrayItem) {
            return renderPrimitiveArrayItem(itemValue, schema.items!, index!)
        } else if (typeArrayOfEnums) {
            return renderArrayOfEnums(itemValue, schema.items!)
        } else if (typeArray) {
            const arrayItems: ReactNode = renderArray(itemValue)

            return getElementFromRegistry(itemValue, arrayItems)
        } else {
            return getElementFromRegistry(itemValue)
        }
    }

    return renderFormElement(value)
}
