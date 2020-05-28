import React, { FormEvent } from 'react'
import { SchemaProperty } from './form-element'

interface FileElementProperties {
    property: SchemaProperty
    value: string
    onChange: (value: string | { filename: string; content: string }) => void
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
                    if (property.instanceof === 'file') {
                        onChange({ filename: inputElement.files![0].name, content: fileContent })
                    } else {
                        onChange(fileContent)
                    }
                }
            })
            reader.readAsDataURL(inputElement.files[0])
        }
    }
    return (
        <span style={{ position: 'relative' }}>
            <input
                type='file'
                onChange={handleChange}
                style={{ position: 'absolute', opacity: '0', width: '100%' }}
                {...(property.contentMediaType ? { accept: property.contentMediaType } : {})}
            />
            <button>Choose file</button>
            <span>{value ? ' File uploaded' : ' No file chosen'}</span>
        </span>
    )
}
