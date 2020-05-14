import React from 'react'

import TextElement from './components/text-element'
import NumericElement from './components/numeric-element'
import SelectElement from './components/select-element'
import CheckboxElement from './components/checkbox-element.tsx'
import ButtonElement from './components/button-element.tsx'
import ElementContainer from './components/element-container.tsx'

import ElementWrapper from './element-wrapper'

export default class ComponentRegistry {
    constructor(customRegistry = {}, wrapper = ElementWrapper) {
        this._registry = {
            enum: { component: SelectElement, wrapper: wrapper },
            boolean: { component: CheckboxElement, wrapper: wrapper },
            number: { component: NumericElement, wrapper: wrapper },
            integer: { component: NumericElement, wrapper: wrapper },
            string: { component: TextElement, wrapper: wrapper },
            button: {component: ButtonElement, wrapper: ElementContainer }
        }

        Object.entries(customRegistry).forEach((customRegistryRecord) => {
            Object.assign(
                this._registry[customRegistryRecord[0]],
                customRegistryRecord[1]
            )
        })

        this.wrapper = wrapper
    }

    getComponent(property, itemValue, handleChange, children) {
        const props = {
            property,
            value: itemValue,
            onChange: handleChange,
            children: children
        }

        const Component =
            (this._registry[property.registryKey] &&
                this._registry[property.registryKey].component) ||
            ElementContainer

        const Wrapper =
            (this._registry[property.registryKey] &&
                this._registry[property.registryKey].wrapper) ||
            this.wrapper

        return (
            <Wrapper {...props}>
                <Component {...props} />
            </Wrapper>
        )
    }
}
