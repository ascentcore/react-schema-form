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

    path?: string
    registryKey?: string
    error?: ajv.ErrorObject[] | boolean
    isRequired?: boolean
    className?: string
}

interface FormElementProperties {
    root: any
    property: SchemaProperty
    path: string
    value: any
    errors: ajv.ErrorObject[]
    error: ajv.ErrorObject[] | boolean
    handleParentChange: (value: any, childPath: string) => void
    registry: ComponentRegistry
}

export default function FormElement({
    root,
    property,
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
            if (value === undefined && property.default !== undefined) {
                handleParentChange(property.default, path)
            }
        }

        const { $ref, items, properties } = property

        if ($ref) {
            setNestedSchema(processRef($ref))
        } else if (items) {
            if (items.$ref) {
                setNestedSchema(processRef(items.$ref))
            } else if (items.properties) {
                setNestedSchema(items)
            }
        } else if (properties) {
            setNestedSchema(property)
        }
        initializeData()
    }, [property])

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

    function renderPrimitiveArrayItem(itemValue: any, propertyType: string, index: number) {
        const registryKey = propertyType
        const pathKey = `${path}[${index}]`

        let arrayElementErrors: ajv.ErrorObject[] | boolean = errors.filter((err) => err.dataPath === pathKey)
        if (arrayElementErrors && arrayElementErrors.length === 0) {
            arrayElementErrors = false
        }

        return registry.getComponent(
            {
                ...property,
                path: pathKey,
                registryKey,
                error: arrayElementErrors,
                title: property.items!.title || property.title,
                type: propertyType
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
                    if (!nestedSchema && property.items && property.items.type) {
                        switch (property.items.type) {
                            case 'integer':
                            case 'number':
                                emptyChild = typeof property.items.minimum === 'number' ? property.items.minimum : 0
                                break
                            case 'boolean':
                                emptyChild = false
                                break
                            default:
                                emptyChild = ''
                        }
                    }
                    handleParentChange([...(itemValue || []), emptyChild], '')
                })}
            </Fragment>
        )
    }

    function getElementFromRegistry(itemValue: any, children: ReactNode | null = null, title?: string, type?: string) {
        const registryKey =
            property.enum || property.options
                ? 'enum'
                : property.contentEncoding || property.contentMediaType
                ? 'file'
                : property.type
        const key = path.substr(path.lastIndexOf('.') + 1)
        const isRequired = root.required && root.required.indexOf(key) > -1

        return registry.getComponent(
            {
                ...property,
                path,
                registryKey,
                error,
                isRequired,
                title: title || property.title,
                type: type || property.type
            },
            itemValue,
            (changedItemValue: string | number | boolean) => handleParentChange(changedItemValue, path),
            children
        )
    }

    function renderFormElement(itemValue: any, index: number | null = null) {
        const typeObjectArrayItem = nestedSchema && property.type === 'array' && index !== null
        const typeObjectOrObjectArrayItem = (nestedSchema && property.type !== 'array') || typeObjectArrayItem

        const typePrimitiveArrayItem =
            !nestedSchema && property.type === 'array' && index !== null && property.items && property.items.type

        const typeArray = property.type === 'array' && index === null

        if (typeObjectOrObjectArrayItem) {
            const pathKey = index === null ? path : `${path}[${index}]`
            const subschema: ReactNode = renderNestedSchema(pathKey, itemValue, index)

            return getElementFromRegistry(
                itemValue,
                subschema,
                nestedSchema!.title,
                typeObjectArrayItem ? nestedSchema!.type : property.type
            )
        } else if (typePrimitiveArrayItem) {
            return renderPrimitiveArrayItem(itemValue, property.items!.type!, index!)
        } else if (typeArray) {
            const arrayItems: ReactNode = renderArray(itemValue)

            return getElementFromRegistry(itemValue, arrayItems)
        } else {
            return getElementFromRegistry(itemValue)
        }
    }

    return renderFormElement(value)
}
