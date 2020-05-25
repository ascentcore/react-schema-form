import React, { ReactNode } from 'react'

import TextElement from './components/text-element'
import NumericElement from './components/numeric-element'
import SelectElement from './components/select-element'
import CheckboxElement from './components/checkbox-element'
import ButtonElement from './components/button-element'
import ElementContainer from './components/element-container'

import ElementWrapper from './element-wrapper'
import { SchemaProperty } from './components/form-element'

export default class ComponentRegistry {
    _registry: { [key: string]: { component: ReactNode; wrapper: ReactNode } }
    _wrapper: ReactNode

    constructor(customRegistry = {}, wrapper: ReactNode = ElementWrapper) {
        this._registry = {
            enum: { component: SelectElement, wrapper: wrapper },
            boolean: { component: CheckboxElement, wrapper: wrapper },
            number: { component: NumericElement, wrapper: wrapper },
            integer: { component: NumericElement, wrapper: wrapper },
            string: { component: TextElement, wrapper: wrapper },
            button: { component: ButtonElement, wrapper: ElementContainer },
            addButton: { component: ButtonElement, wrapper: ElementContainer },
            removeButton: {component: ButtonElement, wrapper: ElementContainer}
        }

        Object.entries(customRegistry).forEach((customRegistryRecord) => {
            Object.assign(this._registry[customRegistryRecord[0]], customRegistryRecord[1])
        })

        this._wrapper = wrapper
    }

    getComponent(
        property: SchemaProperty,
        itemValue: any,
        handleChange: (value: string | number | boolean) => void,
        children: ReactNode | null = null
    ) {
        const props = {
            property,
            value: itemValue,
            onChange: handleChange,
            children: children
        }

        const Component: any =
            (this._registry[property.registryKey!] && this._registry[property.registryKey!].component) ||
            ElementContainer

        const Wrapper: any =
            (this._registry[property.registryKey!] && this._registry[property.registryKey!].wrapper) || this._wrapper

        return (
            <Wrapper {...props}>
                <Component {...props} />
            </Wrapper>
        )
    }
}
