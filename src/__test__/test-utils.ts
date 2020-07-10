import { ReactWrapper } from 'enzyme'

export interface QueryOutput {
    labelText: string | number
    inputValue: string | string[] | null
    errorText: string | number
    input: ReactWrapper | null
}

export function getComponentTree(
    schemaComponent: ReactWrapper,
    wrapperSelector: string = '.ra-elem-wrapper',
    labelSelector: string = '.ra-form-label',
    errorSelector: string = '.ra-elem-error-text',
    componentSelectors: string[] = ['input', 'select']
): QueryOutput[] {
    const tree: QueryOutput[] = []
    console.log("\n")
    schemaComponent.find(wrapperSelector).forEach((child: ReactWrapper) => {
        console.log(child.html())
        const label: ReactWrapper = child.find(labelSelector)
        const labelText = label.length && label.text()

        const error: ReactWrapper = child.find(errorSelector)
        const errorText = error.length && error.text()

        let input: ReactWrapper | null = null
        componentSelectors.some((componentSelector) => {
            const selectedElement = child.find(componentSelector)
            if (selectedElement.length) {
                input = selectedElement
                return true
            }
        })

        //@ts-ignore
        let inputValue: string | number | string[] | null = input && input.instance().value
        //@ts-ignore
        if (input && input.instance().tagName === 'SELECT') {
            //@ts-ignore
            const options = (input.instance() as HTMLSelectElement).options
            const values = []
            for (let i = 0, l = options.length; i < l; i++) {
                if (options[i].selected) {
                    values.push(options[i].value)
                }
            }
            inputValue = values
        }
        tree.push({ labelText, inputValue, errorText, input })
    })

    return tree
}

export function populateTree(tree: any[], list: any[]) {
    list.forEach((value: ReactWrapper, index: number) => {
        const input: ReactWrapper = tree[index].input
        const type: string | null = input.getDOMNode().getAttribute('type')
        if (type == 'checkbox') {
            input.simulate('click')
        } else {
            input.simulate('change', { target: { value } })
        }
    })
}

export function getByCSSSelector(component: ReactWrapper, selector: string): ReactWrapper {
    return component.find(selector)
}
