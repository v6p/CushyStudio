import type { EnumValue } from '../../core/Schema'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { SelectPicker } from 'rsuite'
import { useFlow } from '../../front/FrontFlowCtx'

export const WidgetEnumUI = observer(function WidgetEnumUI_(p: {
    enumName: string
    autofocus?: boolean
    get: () => EnumValue | null
    set: (v: EnumValue | null) => void
    optional?: boolean
}) {
    type T = {
        label: EnumValue
        value: EnumValue | null
    }[]
    const flow = useFlow()
    const schema = flow.st.schema
    const options = useMemo(() => {
        if (schema == null) return []
        const x: T = schema!.getEnumOptionsForSelectPicker(p.enumName)
        if (p.optional) x.unshift({ label: 'none', value: null })
        return x
    }, [schema, p.optional])
    return (
        <SelectPicker //
            // defaultOpen={p.autofocus}
            data={options}
            value={p.get() ?? null}
            onChange={(e) => {
                if (e == null) {
                    if (p.optional) p.set(null)
                    return
                }
                p.set(e)
            }}
        />
    )
})
