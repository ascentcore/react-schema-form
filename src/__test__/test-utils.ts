import { ReactWrapper } from "enzyme"

export interface QueryOutput {
    labelText: string | number;
    inputValue: string;
    errorText: string | number;
    input: ReactWrapper
}

export function getComponentTree(schemaComponent: ReactWrapper,
    wrapperSelector: string = '.ra-elem-wrapper',
    labelSelector: string = '.ra-form-label',
    errorSelector: string = '.ra-elem-error-text',
    componentSelector: string = 'input'): QueryOutput[] {
    const tree: QueryOutput[] = []

    schemaComponent.find(wrapperSelector).forEach((child: ReactWrapper) => {
        console.log(child.html())
        const label: ReactWrapper = child.find(labelSelector)
        const labelText = label.length && label.text()

        const error: ReactWrapper = child.find(errorSelector)
        const errorText = error.length && error.text()

        const input: ReactWrapper = child.find(componentSelector)
        const inputValue = input.length && input.instance().value

        tree.push({ labelText, inputValue, errorText, input })
    })

    return tree;
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

export function getSubmitButton(component: ReactWrapper): ReactWrapper {
    return  component.find('button')
}