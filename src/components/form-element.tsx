import React, { Fragment, useState, useEffect, ReactNode } from 'react'
import { SchemaForm } from '../schema-form'
import ComponentRegistry from '../component-registry'
import ajv from 'ajv'

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
    if?: SchemaProperty
    then?: SchemaProperty
    else?: SchemaProperty
    const?: any
    instanceof?: string

    path?: string
    registryKey?: string
    error?: ajv.ErrorObject[] | boolean
    isRequired?: boolean
    className?: string
}

interface FormElementProperties {
    root: any
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
                    if (schema.type === 'boolean') {
                        handleParentChange(false, path)
                    }
                }
            }
        }

        const { $ref, items, properties } = schema

        if ($ref) {
            setNestedSchema(processRef($ref))
        } else if (items) {
            if (items.$ref) {
                setNestedSchema(processRef(items.$ref))
            } else if (items.properties) {
                setNestedSchema(items)
            }
        } else if (properties) {
            setNestedSchema(schema)
        }
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
                path={pathKey}
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
                ? 'enum'
                : itemProperty.contentEncoding || itemProperty.contentMediaType
                ? 'file'
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
        const isRequired = root.required && root.required.indexOf(key) > -1

        return registry.getComponent(
            {
                enum: itemProperty.enum,
                path,
                registryKey: 'multipleEnum',
                error,
                isRequired,
                title: schema.title,
                type: 'enum'
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
                                    registryKey: 'removeButton',
                                    className: 'ra-remove-button'
                                },
                                'Remove item',
                                handleArrayElementRemoval(index)
                            )}
                        </Fragment>
                    ))}
                {registry.getComponent({ registryKey: 'addButton', className: 'ra-add-button' }, 'Add item', () => {
                    let emptyChild = {}
                    if (!nestedSchema && schema.items && schema.items.type) {
                        switch (schema.items.type) {
                            case 'integer':
                            case 'number':
                                emptyChild = typeof schema.items.minimum === 'number' ? schema.items.minimum : 0
                                break
                            case 'boolean':
                                emptyChild = false
                                break
                            default:
                                emptyChild = ''
                        }
                    }
                    handleParentChange([...(itemValue || []), emptyChild], path)
                })}
            </Fragment>
        )
    }

    function getElementFromRegistry(itemValue: any, children: ReactNode | null = null, title?: string, type?: string) {
        const registryKey =
            schema.enum || schema.options
                ? 'enum'
                : schema.contentEncoding || schema.contentMediaType || schema.instanceof === 'file'
                ? 'file'
                : schema.type
        const key = path.substr(path.lastIndexOf('.') + 1)
        const isRequired = root.required && root.required.indexOf(key) > -1

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
                    schema.instanceof === 'file' ? schema.properties!.content.contentMediaType : schema.contentMediaType
            },
            itemValue,
            (changedItemValue: string | number | boolean) => handleParentChange(changedItemValue, path),
            children
        )
    }

    function renderFormElement(itemValue: any, index: number | null = null) {
        const typeObjectArrayItem = nestedSchema && schema.type === 'array' && index !== null
        const typeObjectOrObjectArrayItem = (nestedSchema && schema.type !== 'array') || typeObjectArrayItem

        const typePrimitiveArrayItem =
            !nestedSchema && schema.type === 'array' && index !== null && schema.items && schema.items.type

        const typeArray = schema.type === 'array' && index === null
        const typeArrayOfEnums =
            schema.type === 'array' &&
            index === null &&
            schema.items &&
            schema.items.type === 'string' &&
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
