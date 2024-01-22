import { observer } from 'mobx-react-lite'
import { InputNumberUI } from 'src/rsuite/InputNumberUI'
import { Widget_number } from './WidgetNumber'

export const WidgetNumberUI = observer(function WidgetNumberUI_(p: { widget: Widget_number }) {
    const widget = p.widget
    const value = widget.serial.val
    const mode = widget.config.mode
    const step = widget.config.step ?? (mode === 'int' ? 1 : 0.1)

    return (
        <InputNumberUI
            //
            mode={mode}
            value={value}
            hideSlider={widget.config.hideSlider}
            max={widget.config.max}
            min={widget.config.min}
            step={step}
            onValueChange={(next) => (widget.serial.val = next)}
        />
    )
})