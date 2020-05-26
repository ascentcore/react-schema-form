import React, { FormEvent, Fragment } from 'react'
import { SchemaProperty } from './form-element'

interface FileElementProperties {
    property: SchemaProperty
    value: string
    onChange: (value: string) => void
}

export default function FileElement({ property, value, onChange }: FileElementProperties) {
    const handleChange = (event: FormEvent<HTMLInputElement>) => {
        const inputElement = event.target as HTMLInputElement
        if (inputElement.files && inputElement.files.length) {
            var reader = new FileReader()
            reader.addEventListener('load', function () {
                if (reader.result) {
                    let fileContent =
                        typeof reader.result === 'string' ? reader.result : Buffer.from(reader.result).toString()
                    fileContent = fileContent.split(';base64,')[1]
                    onChange(fileContent)
                }
            })
            reader.readAsDataURL(inputElement.files[0])
        }
    }

    return (
        <Fragment>
            <input type='file' onChange={handleChange} />
        </Fragment>
    )
}
