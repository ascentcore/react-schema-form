import React from 'react'

import TextElement from './components/text-element'
import NumericElement from './components/numeric-element'
import SelectElement from './components/select-element'
import CheckboxElement from './components/checkbox-element'
import FormContainer from './components/form-container'

import ElementWrapper from './element-wrapper'

export default class ComponentRegistry {
    constructor(customRegistry = {}, wrapper = ElementWrapper) {
        this._registry = {
            enum: { component: SelectElement, wrapper: wrapper },
            boolean: { component: CheckboxElement, wrapper: wrapper },
            number: { component: NumericElement, wrapper: wrapper },
            integer: { component: NumericElement, wrapper: wrapper },
            string: { component: TextElement, wrapper: wrapper }
        }

        Object.entries(customRegistry).forEach((customRegistryRecord) => {
            Object.assign(
                this._registry[customRegistryRecord[0]],
                customRegistryRecord[1]
            )
        })

        this.wrapper = wrapper
    }

    getComponent(property, itemValue, handleChange) {
        const props = {
            property,
            value: itemValue,
            onChange: handleChange
        }

        const Component =
            (this._registry[property.registryKey] &&
                this._registry[property.registryKey].component) ||
            FormContainer

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
