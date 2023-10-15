/**
 * this file is an attempt to centralize core widget definition in a single
 * file so it's easy to add any widget in the future
 */
import type { CELL } from 'src/front/ui/widgets/WidgetMatrixUI'
import type { SchemaL } from 'src/models/Schema'
import type { SimplifiedLoraDef } from 'src/presets/SimplifiedLoraDef'
import type { WidgetPromptOutput } from 'src/prompter/WidgetPromptUI'
import type { PossibleSerializedNodes } from 'src/prompter/plugins/CushyDebugPlugin'
import type { AspectRatio, CushySize, CushySizeByRatio, ImageAnswer, ImageAnswerForm, SDModelType } from './misc/InfoAnswer'
import type { ItemDataType } from 'rsuite/esm/@types/common'

import { makeAutoObservable } from 'mobx'
import { bang } from 'src/utils/bang'

export type ReqResult<Req> = Req extends IWidget<any, any, any, infer O> ? O : never
export type ReqState<Req> = Req extends IWidget<any, any, infer S, any> ? S : never
export type IWidget<I, X, S, O> = { $Input: I; $Serial: X; $State: S; $Output: O }
export type IRequest<I, X, S, O> = {
    state: S
    readonly result: O
}

export type ReqInput<X> = X & {
    label?: string
    group?: string
    tooltip?: string
    i18n?: { [key: string]: string }
}

// 🅿️ str ==============================================================================
export type Requestable_str_input = ReqInput<{ default?: string; textarea?: boolean }>
export type Requestable_str_serial = Requestable_str_state
export type Requestable_str_state = { active: true; val: string }
export type Requestable_str_output = string
export interface Requestable_str extends IWidget<Requestable_str_input, Requestable_str_serial, Requestable_str_state, Requestable_str_output> {}
export class Requestable_str implements IRequest<Requestable_str_input, Requestable_str_serial, Requestable_str_state, Requestable_str_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_str_input,
        public serial?: Requestable_str_serial,
    ) {
        this.state = serial ?? { active: true, val: input.default ?? '' }
        makeAutoObservable(this)
    }
    state: Requestable_str_state
    get result(): Requestable_str_output {
        return this.state.val
    }
}

// 🅿️ strOpt ==============================================================================
export type Requestable_strOpt_input = ReqInput<{ default?: string; textarea?: boolean }>
export type Requestable_strOpt_serial = Requestable_strOpt_state
export type Requestable_strOpt_state = { active: boolean; val: string }
export type Requestable_strOpt_output = Maybe<string>
export interface Requestable_strOpt extends IWidget<Requestable_strOpt_input, Requestable_strOpt_serial, Requestable_strOpt_state, Requestable_strOpt_output> {}
export class Requestable_strOpt implements IRequest<Requestable_strOpt_input, Requestable_strOpt_serial, Requestable_strOpt_state, Requestable_strOpt_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_strOpt_input,
        public serial?: Requestable_strOpt_serial,
    ) {
        this.state = serial ?? {
            active: input.default != null,
            val: input.default ?? '',
        }
        makeAutoObservable(this)
    }
    state: Requestable_strOpt_state
    get result(): Requestable_strOpt_output {
        if (!this.state.active) return undefined
        return this.state.val
    }
}

// 🅿️ prompt ==============================================================================
export type Requestable_prompt_input = ReqInput<{ default?: string | WidgetPromptOutput }>
export type Requestable_prompt_serial = Requestable_prompt_state
export type Requestable_prompt_state = WidgetPromptOutput<true>
export type Requestable_prompt_output = WidgetPromptOutput<true>
export interface Requestable_prompt extends IWidget<Requestable_prompt_input, Requestable_prompt_serial, Requestable_prompt_state, Requestable_prompt_output> {}
export class Requestable_prompt implements IRequest<Requestable_prompt_input, Requestable_prompt_serial, Requestable_prompt_state, Requestable_prompt_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_prompt_input,
        public serial?: Requestable_prompt_serial,
    ) {
        if (serial) {
            this.state = serial
        } else {
            this.state = { active: true, text: '', tokens: [] }

            const def = input.default
            if (def != null) {
                if (typeof def === 'string') {
                    this.state.text = def
                    this.state.tokens = [{ type: 'text', text: def }]
                }
                if (typeof Array.isArray(def)) {
                    // 🔴
                }
            }
        }
        makeAutoObservable(this)
    }
    state: Requestable_prompt_state
    get result(): Requestable_prompt_output {
        // does need to check value
        JSON.stringify(this.state) // 🔶 force deep observation
        return this.state
    }
}

// 🅿️ promptOpt ==============================================================================
export type Requestable_promptOpt_input = ReqInput<{ default?: string | PossibleSerializedNodes[] }>
export type Requestable_promptOpt_serial = Requestable_promptOpt_state
export type Requestable_promptOpt_state = WidgetPromptOutput<boolean>
export type Requestable_promptOpt_output = Maybe<WidgetPromptOutput>
export interface Requestable_promptOpt extends IWidget<Requestable_promptOpt_input, Requestable_promptOpt_serial, Requestable_promptOpt_state, Requestable_promptOpt_output> {}
export class Requestable_promptOpt implements IRequest<Requestable_promptOpt_input, Requestable_promptOpt_serial, Requestable_promptOpt_state, Requestable_promptOpt_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_promptOpt_input,
        public serial?: Requestable_promptOpt_serial,
    ) {
        if (serial) {
            this.state = serial
        } else {
            this.state = { active: false, text: '', tokens: [] }
            const def = input.default
            if (def != null) {
                if (typeof def === 'string') {
                    this.state.active = true
                    this.state.text = def
                    this.state.tokens = [{ type: 'text', text: def }]
                }
                if (typeof Array.isArray(def)) {
                    // 🔴
                }
            }
        }
        makeAutoObservable(this)
    }
    state: Requestable_promptOpt_state
    get result(): Requestable_promptOpt_output {
        if (this.state.active === false) return undefined
        return this.state
    }
}

// 🅿️ int ==============================================================================
export type Requestable_int_input = ReqInput<{ default?: number; min?: number; max?: number }>
export type Requestable_int_serial = Requestable_int_state
export type Requestable_int_state = { active: true; val: number }
export type Requestable_int_output = number
export interface Requestable_int extends IWidget<Requestable_int_input, Requestable_int_serial, Requestable_int_state, Requestable_int_output> {}
export class Requestable_int implements IRequest<Requestable_int_input, Requestable_int_serial, Requestable_int_state, Requestable_int_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_int_input,
        public serial?: Requestable_int_serial,
    ) {
        this.state = serial ?? { active: true, val: input.default ?? 0 }
        makeAutoObservable(this)
    }
    state: Requestable_int_state
    get result(): Requestable_int_output {
        return this.state.val
    }
}

// 🅿️ float ==============================================================================
export type Requestable_float_input = ReqInput<{ default?: number; min?: number; max?: number }>
export type Requestable_float_serial = Requestable_float_state
export type Requestable_float_state = { active: true; val: number }
export type Requestable_float_output = number
export interface Requestable_float extends IWidget<Requestable_float_input, Requestable_float_serial, Requestable_float_state, Requestable_float_output> {}
export class Requestable_float implements IRequest<Requestable_float_input, Requestable_float_serial, Requestable_float_state, Requestable_float_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_float_input,
        public serial?: Requestable_float_serial,
    ) {
        this.state = serial ?? { active: true, val: input.default ?? 0 }
        makeAutoObservable(this)
    }
    state: Requestable_float_state
    get result(): Requestable_float_output {
        return this.state.val
    }
}

// 🅿️ bool ==============================================================================
export type Requestable_bool_input = ReqInput<{ default?: boolean }>
export type Requestable_bool_serial = Requestable_bool_state
export type Requestable_bool_state = { active: true; val: boolean }
export type Requestable_bool_output = boolean
export interface Requestable_bool extends IWidget<Requestable_bool_input, Requestable_bool_serial, Requestable_bool_state, Requestable_bool_output> {}
export class Requestable_bool implements IRequest<Requestable_bool_input, Requestable_bool_serial, Requestable_bool_state, Requestable_bool_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_bool_input,
        public serial?: Requestable_bool_serial,
    ) {
        this.state = serial ?? { active: true, val: input.default ?? false }
        makeAutoObservable(this)
    }
    state: Requestable_bool_state
    get result(): Requestable_bool_output {
        return this.state.val
    }
}

// 🅿️ intOpt ==============================================================================
export type Requestable_intOpt_input = ReqInput<{ default?: number; min?: number; max?: number; step?: number }>
export type Requestable_intOpt_serial = Requestable_intOpt_state
export type Requestable_intOpt_state = { active: boolean; val: number }
export type Requestable_intOpt_output = Maybe<number>
export interface Requestable_intOpt extends IWidget<Requestable_intOpt_input, Requestable_intOpt_serial, Requestable_intOpt_state, Requestable_intOpt_output> {}
export class Requestable_intOpt implements IRequest<Requestable_intOpt_input, Requestable_intOpt_serial, Requestable_intOpt_state, Requestable_intOpt_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_intOpt_input,
        public serial?: Requestable_intOpt_serial,
    ) {
        this.state = serial ?? {
            active: input.default != null,
            val: input.default ?? 0,
        }
        makeAutoObservable(this)
    }
    state: Requestable_intOpt_state
    get result(): Requestable_intOpt_output {
        if (this.state.active === false) return undefined
        return this.state.val
    }
}

// 🅿️ floatOpt ==============================================================================
export type Requestable_floatOpt_input = ReqInput<{ default?: number; min?: number; max?: number; step?: number }>
export type Requestable_floatOpt_serial = Requestable_floatOpt_state
export type Requestable_floatOpt_state = { active: boolean; val: number }
export type Requestable_floatOpt_output = Maybe<number>
export interface Requestable_floatOpt extends IWidget<Requestable_floatOpt_input, Requestable_floatOpt_serial, Requestable_floatOpt_state, Requestable_floatOpt_output> {}
export class Requestable_floatOpt implements IRequest<Requestable_floatOpt_input, Requestable_floatOpt_serial, Requestable_floatOpt_state, Requestable_floatOpt_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_floatOpt_input,
        public serial?: Requestable_floatOpt_serial,
    ) {
        this.state = serial ?? {
            active: input.default != null,
            val: input.default ?? 0,
        }
        makeAutoObservable(this)
    }
    state: Requestable_floatOpt_state
    get result(): Requestable_floatOpt_output {
        if (this.state.active === false) return undefined
        return this.state.val
    }
}

// 🅿️ size ==============================================================================
export type Requestable_size_input = ReqInput<{ default?: CushySizeByRatio }>
export type Requestable_size_serial = Requestable_size_state
export type Requestable_size_state = CushySize
export type Requestable_size_output = CushySize
export interface Requestable_size extends IWidget<Requestable_size_input, Requestable_size_serial, Requestable_size_state, Requestable_size_output> {}
export class Requestable_size implements IRequest<Requestable_size_input, Requestable_size_serial, Requestable_size_state, Requestable_size_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_size_input,
        public serial?: Requestable_size_serial,
    ) {
        if (serial) {
            this.state = serial
        } else {
            const aspectRatio: AspectRatio = input.default?.aspectRatio ?? '1:1'
            const modelType: SDModelType = input.default?.modelType ?? 'SD1.5 512'
            const width = 512 // 🔴
            const height = 512 // 🔴
            this.state = {
                aspectRatio,
                modelType,
                height,
                width,
            }
        }
        makeAutoObservable(this)
    }
    state: Requestable_size_state
    get result(): Requestable_size_output {
        return this.state
    }
}

// 🅿️ matrix ==============================================================================
export type Requestable_matrix_input = ReqInput<{ default?: { row: string; col: string }[]; rows: string[]; cols: string[] }>
export type Requestable_matrix_serial = Requestable_matrix_state
export type Requestable_matrix_state = { active: true; selected: CELL[] }
export type Requestable_matrix_output = CELL[]
export interface Requestable_matrix extends IWidget<Requestable_matrix_input, Requestable_matrix_serial, Requestable_matrix_state, Requestable_matrix_output> {}
export class Requestable_matrix implements IRequest<Requestable_matrix_input, Requestable_matrix_serial, Requestable_matrix_state, Requestable_matrix_output> {
    rows: string[]
    cols: string[]

    constructor(
        public schema: SchemaL,
        public input: Requestable_matrix_input,
        public serial?: Requestable_matrix_serial,
    ) {
        this.state = serial ?? { active: true, selected: [] } // 🔴 handle default values

        const rows = input.rows
        const cols = input.cols
        // init all cells to false
        for (const [rowIx, row] of rows.entries()) {
            for (const [colIx, col] of cols.entries()) {
                this.store.set(this.key(row, col), { x: rowIx, y: colIx, col, row, value: false })
            }
        }
        // apply default value
        const values = this.state.selected
        if (values)
            for (const v of values) {
                this.store.set(this.key(rows[v.x], cols[v.y]), v)
            }
        this.rows = input.rows
        this.cols = input.cols
        // make observable
        makeAutoObservable(this)
    }
    state: Requestable_matrix_state
    get result(): Requestable_matrix_output {
        // if (!this.state.active) return undefined
        return this.state.selected
    }

    // (((((((((((((((((((((((((((((
    private sep = ' &&& '
    private store = new Map<string, CELL>()
    private key = (row: string, col: string) => `${row}${this.sep}${col}`
    get allCells() { return Array.from(this.store.values()) } // prettier-ignore
    UPDATE = () => (this.state.selected = this.RESULT)
    get RESULT() {
        return this.allCells.filter((v) => v.value)
    }

    get firstValue() {
        return this.allCells[0]?.value ?? false
    }

    setAll = (value: boolean) => {
        for (const v of this.allCells) v.value = value
        // this.p.set(this.values)
    }

    setRow = (row: string, val: boolean) => {
        for (const v of this.cols) {
            const cell = this.get(row, v)
            cell.value = val
        }
        this.UPDATE()
    }

    setCol = (col: string, val: boolean) => {
        for (const r of this.rows) {
            const cell = this.get(r, col)
            cell.value = val
        }
        this.UPDATE()
    }

    get = (row: string, col: string): CELL => {
        return bang(this.store.get(this.key(row, col)))
    }

    set = (row: string, col: string, value: boolean) => {
        const cell = this.get(row, col)
        cell.value = value
        this.UPDATE()
    }
    // )))))))))))))))))))))))))))))
}

// 🅿️ loras ==============================================================================
export type Requestable_loras_input = ReqInput<{ default?: SimplifiedLoraDef[] }>
export type Requestable_loras_serial = Requestable_loras_state
export type Requestable_loras_state = { active: true; loras: SimplifiedLoraDef[] }
export type Requestable_loras_output = SimplifiedLoraDef[]
export interface Requestable_loras extends IWidget<Requestable_loras_input, Requestable_loras_serial, Requestable_loras_state, Requestable_loras_output> {}
export class Requestable_loras implements IRequest<Requestable_loras_input, Requestable_loras_serial, Requestable_loras_state, Requestable_loras_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_loras_input,
        public serial?: Requestable_loras_serial,
    ) {
        this.state = serial ?? { active: true, loras: input.default ?? [] }
        this.allLoras = schema.getLoras()
        for (const lora of this.allLoras) {
            if (lora === 'None') continue
            this._insertLora(lora)
        }
        for (const v of this.state.loras) this.selectedLoras.set(v.name, v)
        makeAutoObservable(this)
    }
    state: Requestable_loras_state
    get result(): Requestable_loras_output {
        return this.state.loras
    }
    allLoras: string[]
    selectedLoras = new Map<string, SimplifiedLoraDef>()
    FOLDER: ItemDataType<any>[] = []
    private _insertLora = (rawPath: string) => {
        const path = rawPath.replace(/\\/g, '/')
        const segments = path.split('/')
        let folder = this.FOLDER
        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i]
            const found = folder.find((x) => x.label === segment)
            if (found == null) {
                const value = segments.slice(0, i + 1).join('\\')
                const node = { label: segment, value: value, children: [] }
                folder.push(node)
                folder = node.children
            } else {
                folder = found.children!
            }
        }
        folder.push({ label: segments[segments.length - 1], value: rawPath })
    }
}

// 🅿️ image ==============================================================================
export type Requestable_image_input = ReqInput<{ default?: ImageAnswer }>
export type Requestable_image_serial = Requestable_image_state
export type Requestable_image_state = ImageAnswerForm<true>
export type Requestable_image_output = ImageAnswer
export interface Requestable_image extends IWidget<Requestable_image_input, Requestable_image_serial, Requestable_image_state, Requestable_image_output> {}
export class Requestable_image implements IRequest<Requestable_image_input, Requestable_image_serial, Requestable_image_state, Requestable_image_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_image_input,
        public serial?: Requestable_image_serial,
    ) {
        this.state = serial ?? {
            active: true,
            comfy: input.default?.type === 'ComfyImage' ? input.default : { imageName: 'example.png', type: 'ComfyImage' },
            cushy: input.default?.type === 'CushyImage' ? input.default : null,
            pick: input.default?.type === 'CushyImage' ? 'cushy' : 'comfy',
        }
        makeAutoObservable(this)
    }
    state: Requestable_image_state
    get result(): Requestable_image_output {
        if (this.state.pick === 'cushy' && this.state.cushy) return this.state.cushy
        return this.state.comfy
    }
}

// 🅿️ imageOpt ==============================================================================
export type Requestable_imageOpt_input = ReqInput<{ default?: ImageAnswer }>
export type Requestable_imageOpt_serial = Requestable_imageOpt_state
export type Requestable_imageOpt_state = ImageAnswerForm<boolean>
export type Requestable_imageOpt_output = Maybe<ImageAnswer>
export interface Requestable_imageOpt extends IWidget<Requestable_imageOpt_input, Requestable_imageOpt_serial, Requestable_imageOpt_state, Requestable_imageOpt_output> {}
export class Requestable_imageOpt implements IRequest<Requestable_imageOpt_input, Requestable_imageOpt_serial, Requestable_imageOpt_state, Requestable_imageOpt_output> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_imageOpt_input,
        public serial?: Requestable_imageOpt_serial,
    ) {
        this.state = serial ?? {
            active: input.default ? true : false,
            comfy: input.default?.type === 'ComfyImage' ? input.default : { imageName: 'example.png', type: 'ComfyImage' },
            cushy: input.default?.type === 'CushyImage' ? input.default : null,
            pick: input.default?.type === 'CushyImage' ? 'cushy' : 'comfy',
        }
        makeAutoObservable(this)
    }
    state: Requestable_imageOpt_state
    get result(): Requestable_imageOpt_output {
        if (!this.state.active) return undefined
        if (this.state.pick === 'cushy' && this.state.cushy) return this.state.cushy
        return this.state.comfy
    }
}

// 🅿️ selectOne ==============================================================================
export type Requestable_selectOne_input<T> = ReqInput<{ default?: T; choices: T[] }>
export type Requestable_selectOne_serial<T> = Requestable_selectOne_state<T>
export type Requestable_selectOne_state<T> = { query: string; val: T }
export type Requestable_selectOne_output<T> = T
export interface Requestable_selectOne<T> extends IWidget<Requestable_selectOne_input<T>, Requestable_selectOne_serial<T>, Requestable_selectOne_state<T>, Requestable_selectOne_output<T>> {}
export class Requestable_selectOne<T> implements IRequest<Requestable_selectOne_input<T>, Requestable_selectOne_serial<T>, Requestable_selectOne_state<T>, Requestable_selectOne_output<T>> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_selectOne_input<T>,
        public serial?: Requestable_selectOne_serial<T>,
    ) {
        this.state = serial ?? {
            query: '',
            val: input.default ?? input.choices[0],
        }
        makeAutoObservable(this)
    }
    state: Requestable_selectOne_state<T>
    get result(): Requestable_selectOne_output<T> {
        return this.state.val
    }
}

// 🅿️ selectOneOrCustom ==============================================================================
export type Requestable_selectOneOrCustom_input = ReqInput<{ default?: string; choices: string[] }>
export type Requestable_selectOneOrCustom_serial = Requestable_selectOneOrCustom_state
export type Requestable_selectOneOrCustom_state = { query: string; val: string }
export type Requestable_selectOneOrCustom_output = string
export interface Requestable_selectOneOrCustom extends IWidget<Requestable_selectOneOrCustom_input, Requestable_selectOneOrCustom_serial, Requestable_selectOneOrCustom_state, Requestable_selectOneOrCustom_output > {}
export class Requestable_selectOneOrCustom implements IRequest<Requestable_selectOneOrCustom_input, Requestable_selectOneOrCustom_serial, Requestable_selectOneOrCustom_state, Requestable_selectOneOrCustom_output > {
    constructor(
        public schema: SchemaL,
        public input: Requestable_selectOneOrCustom_input,
        public serial?: Requestable_selectOneOrCustom_serial,
    ) {
        this.state = serial ?? {
            query: '',
            val: input.default ?? input.choices[0] ?? '',
        }
        makeAutoObservable(this)
    }
    state: Requestable_selectOneOrCustom_state
    get result(): Requestable_selectOneOrCustom_output {
        return this.state.val
    }
}

// 🅿️ selectMany ==============================================================================
export type Requestable_selectMany_input<T extends { type: string }> = ReqInput<{ default?: T[]; choices: T[] }>
export type Requestable_selectMany_serial<T extends { type: string }> = { query: string; values: { type: string }[] }
export type Requestable_selectMany_state<T extends { type: string }> = { query: string; values: T[] }
export type Requestable_selectMany_output<T extends { type: string }> = T[]
export interface Requestable_selectMany<T extends { type: string }> extends IWidget<Requestable_selectMany_input<T>, Requestable_selectMany_serial<T>, Requestable_selectMany_state<T>, Requestable_selectMany_output<T>> {}
export class Requestable_selectMany<T extends { type: string }> implements IRequest<Requestable_selectMany_input<T>, Requestable_selectMany_serial<T>, Requestable_selectMany_state<T>, Requestable_selectMany_output<T>> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_selectMany_input<T>,
        public serial?: Requestable_selectMany_serial<T>,
    ) {
        this.state = serial ?? {
            query: '',
            values: input.default ?? [],
        }
        makeAutoObservable(this)
    }
    state: Requestable_selectMany_state<T>
    get result(): Requestable_selectMany_output<T> {
        return this.state.values
    }
}

// 🅿️ selectManyOrCustom ==============================================================================
export type Requestable_selectManyOrCustom_input = ReqInput<{ default?: string[]; choices: string[] }>
export type Requestable_selectManyOrCustom_serial = Requestable_selectManyOrCustom_state
export type Requestable_selectManyOrCustom_state = { query: string; values: string[] }
export type Requestable_selectManyOrCustom_output = string[]
export interface Requestable_selectManyOrCustom extends IWidget< Requestable_selectManyOrCustom_input, Requestable_selectManyOrCustom_serial, Requestable_selectManyOrCustom_state, Requestable_selectManyOrCustom_output > {}
export class Requestable_selectManyOrCustom implements IRequest< Requestable_selectManyOrCustom_input, Requestable_selectManyOrCustom_serial, Requestable_selectManyOrCustom_state, Requestable_selectManyOrCustom_output > {
    constructor(
        public schema: SchemaL,
        public input: Requestable_selectManyOrCustom_input,
        public serial?: Requestable_selectManyOrCustom_serial,
    ) {
        this.state = serial ?? {
            query: '',
            values: input.default ?? [],
        }
        makeAutoObservable(this)
    }
    state: Requestable_selectManyOrCustom_state
    get result(): Requestable_selectManyOrCustom_output {
        return this.state.values
    }
}

// 🅿️ list ==============================================================================
export type Requestable_list_input<T extends Requestable> = ReqInput<{ /* 🟢 NO DEFAULT */ mkItem: (ix: number) => T }>
export type Requestable_list_serial<T extends Requestable> = { active: true; items: 🔴T[] }
export type Requestable_list_state<T extends Requestable> = { active: true; items: T[] }
export type Requestable_list_output<T extends Requestable> = T['$Output'][]
export interface Requestable_list<T extends Requestable> extends IWidget<Requestable_list_input<T>, Requestable_list_serial<T>, Requestable_list_state<T>, Requestable_list_output<T>> {}
export class Requestable_list<T extends Requestable> implements IRequest<Requestable_list_input<T>, Requestable_list_serial<T>, Requestable_list_state<T>, Requestable_list_output<T>> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_list_input<T>,
        public serial?: Requestable_list_serial<T>,
    ) {
        // 🔴 prev state can't be an instance there
        this.state = serial ?? {
            active: true,
            items: [],
        }
        makeAutoObservable(this)
    }
    state: Requestable_list_state<T>
    get json(): Requestable_list_serial<T> {
        return {
            active: this.state.active,
            items: this.state.items.map((i) => i.json)
        }
    }
    get result(): Requestable_list_output<T> {
        return this.state.items.map((i) => i.result)
    }
    addItem() {
        this.state.items.push(this.input.mkItem(this.state.items.length))
    }
}

// 🅿️ group ==============================================================================
export type Requestable_group_input<T extends { [key: string]: Requestable }> = ReqInput<{ items: T }>
export type Requestable_group_serial<T extends { [key: string]: Requestable }> = { active: true; values: {[k in keyof T]: T[k]['$Serial']} }
export type Requestable_group_state<T extends { [key: string]: Requestable }> = { active: true; values: T }
export type Requestable_group_output<T extends { [key: string]: Requestable }> = { [k in keyof T]: ReqResult<T[k]> }
export interface Requestable_group<T extends { [key: string]: Requestable }> extends IWidget<Requestable_group_input<T>, Requestable_group_serial<T>, Requestable_group_state<T>, Requestable_group_output<T>> {}
export class Requestable_group<T extends { [key: string]: Requestable }> implements IRequest<Requestable_group_input<T>, Requestable_group_serial<T>, Requestable_group_state<T>, Requestable_group_output<T>> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_group_input<T>,
        public serial?: Requestable_group_serial<T>,
    ) {
        this.state = serial ?? {
            active: true,
            values: input.items,
        }
        makeAutoObservable(this)
    }
    state: Requestable_group_state<T>
    get result(): Requestable_group_output<T> {
        const out: { [key: string]: any } = {}
        for (const key in this.state.values) {
            out[key] = this.state.values[key].result
        }
        return out as any
    }
}

// 🅿️ groupOpt ==============================================================================
export type Requestable_groupOpt_input<T extends { [key: string]: Requestable }> = ReqInput<{ default?: boolean; items: T }>
export type Requestable_groupOpt_serial<T extends { [key: string]: Requestable }> = { active: boolean; values: {[K in keyof T]: T[K]['$Serial']} }
export type Requestable_groupOpt_state<T extends { [key: string]: Requestable }> = { active: boolean; values: T }
export type Requestable_groupOpt_output<T extends { [key: string]: Requestable }> = Maybe<{ [k in keyof T]: ReqResult<T[k]> }>
export interface Requestable_groupOpt<T extends { [key: string]: Requestable }> extends IWidget<Requestable_groupOpt_input<T>, Requestable_groupOpt_serial<T>, Requestable_groupOpt_state<T>, Requestable_groupOpt_output<T>> {}
export class Requestable_groupOpt<T extends { [key: string]: Requestable }> implements IRequest<Requestable_groupOpt_input<T>, Requestable_groupOpt_serial<T>, Requestable_groupOpt_state<T>, Requestable_groupOpt_output<T>> {
    constructor(
        public schema: SchemaL,
        public input: Requestable_groupOpt_input<T>,
        public serial?: Requestable_groupOpt_staserial,
    ) {
        this.state = serial ?? {
            active: input.default ?? false,
            values: input.items,
        }
        makeAutoObservable(this)
    }
    state: Requestable_groupOpt_state<T>
    get result(): Requestable_groupOpt_output<T> {
        if (!this.state.active) return undefined
        const out: { [key: string]: any } = {}
        for (const key in this.state.values) {
            out[key] = this.state.values[key].result
        }
        return out as any
    }
}

// 🅿️ enum ==============================================================================
export type Requestable_enum_input<T extends KnownEnumNames> = ReqInput<{ default?: Requirable[T]; enumName: T }>
export type Requestable_enum_state<T extends KnownEnumNames> = { active: true; val: Requirable[T] }
export type Requestable_enum_output<T extends KnownEnumNames> = Requirable[T]
export interface Requestable_enum<T extends KnownEnumNames>
    extends IWidget<Requestable_enum_input<T>, Requestable_enum_state<T>, Requestable_enum_output<T>> {}
export class Requestable_enum<T extends KnownEnumNames>
    implements IRequest<Requestable_enum_input<T>, Requestable_enum_state<T>, Requestable_enum_output<T>>
{
    type = 'enum'
    constructor(
        public schema: SchemaL,
        public input: Requestable_enum_input<T>,
        public serial?: Requestable_enum_staserial,
    ) {
        const possibleValues = this.schema.knownEnumsByName.get(input.enumName) ?? []
        this.state = serial ?? {
            active: true,
            val: input.default ?? (possibleValues[0] as any) /* 🔴 */,
        }
        makeAutoObservable(this)
    }
    state: Requestable_enum_state<T>
    get result(): Requestable_enum_output<T> {
        return this.state.val
    }
}

// 🅿️ enumOpt ==============================================================================
export type Requestable_enumOpt_input<T extends KnownEnumNames> = ReqInput<{ default?: Requirable[T]; enumName: T }>
export type Requestable_enumOpt_state<T extends KnownEnumNames> = { active: boolean; val: Requirable[T] }
export type Requestable_enumOpt_output<T extends KnownEnumNames> = Maybe<Requirable[T]>
export interface Requestable_enumOpt<T extends KnownEnumNames>
    extends IWidget<Requestable_enumOpt_input<T>, Requestable_enumOpt_state<T>, Requestable_enumOpt_output<T>> {}
export class Requestable_enumOpt<T extends KnownEnumNames>
    implements IRequest<Requestable_enumOpt_input<T>, Requestable_enumOpt_state<T>, Requestable_enumOpt_output<T>>
{
    type = 'enum?'
    constructor(
        public schema: SchemaL,
        public input: Requestable_enumOpt_input<T>,
        public serial?: Requestable_enumOpt_staserial,
    ) {
        const possibleValues = this.schema.knownEnumsByName.get(input.enumName) ?? []
        this.state = serial ?? {
            active: input.default != null,
            val: input.default ?? (possibleValues[0] as any) /* 🔴 */,
        }
        makeAutoObservable(this)
    }
    state: Requestable_enumOpt_state<T>
    get result(): Requestable_enumOpt_output<T> {
        if (!this.state.active) return undefined
        return this.state.val
    }
}

// requestable are a closed union
export type Requestable =
    | Requestable_str
    | Requestable_strOpt
    | Requestable_prompt
    | Requestable_promptOpt
    | Requestable_int
    | Requestable_float
    | Requestable_bool
    | Requestable_intOpt
    | Requestable_floatOpt
    | Requestable_size
    | Requestable_matrix
    | Requestable_loras
    | Requestable_image
    | Requestable_imageOpt
    | Requestable_selectOneOrCustom
    | Requestable_selectMany<any>
    | Requestable_selectManyOrCustom
    | Requestable_selectOne<any>
    | Requestable_list<any>
    | Requestable_group<any>
    | Requestable_groupOpt<any>
    | Requestable_enum<KnownEnumNames>
    | Requestable_enumOpt<KnownEnumNames>

// prettier-ignore
export class FormBuilder {
    constructor(public schema: SchemaL) {}

    string             = (p: Requestable_str_input)                => new Requestable_str(this.schema, p)
    stringOpt          = (p: Requestable_strOpt_input)             => new Requestable_strOpt(this.schema, p)
    str                = (p: Requestable_str_input)                => new Requestable_str(this.schema, p)
    strOpt             = (p: Requestable_strOpt_input)             => new Requestable_strOpt(this.schema, p)
    prompt             = (p: Requestable_prompt_input)             => new Requestable_prompt(this.schema, p)
    promptOpt          = (p: Requestable_promptOpt_input)          => new Requestable_promptOpt(this.schema, p)
    int                = (p: Requestable_int_input)                => new Requestable_int(this.schema, p)
    intOpt             = (p: Requestable_intOpt_input)             => new Requestable_intOpt(this.schema, p)
    float              = (p: Requestable_float_input)              => new Requestable_float(this.schema, p)
    floatOpt           = (p: Requestable_floatOpt_input)           => new Requestable_floatOpt(this.schema, p)
    number             = (p: Requestable_float_input)              => new Requestable_float(this.schema, p)
    numberOpt          = (p: Requestable_floatOpt_input)           => new Requestable_floatOpt(this.schema, p)
    matrix             = (p: Requestable_matrix_input)             => new Requestable_matrix(this.schema, p)
    boolean            = (p: Requestable_bool_input)               => new Requestable_bool(this.schema, p)
    bool               = (p: Requestable_bool_input)               => new Requestable_bool(this.schema, p)
    loras              = (p: Requestable_loras_input)              => new Requestable_loras(this.schema, p)
    image              = (p: Requestable_image_input)              => new Requestable_image(this.schema, p)
    imageOpt           = (p: Requestable_imageOpt_input)           => new Requestable_imageOpt(this.schema, p)
    selectOneOrCustom  = (p: Requestable_selectOneOrCustom_input)  => new Requestable_selectOneOrCustom(this.schema, p)
    selectManyOrCustom = (p: Requestable_selectManyOrCustom_input) => new Requestable_selectManyOrCustom(this.schema, p)
    enum               = <const T extends KnownEnumNames>                 (p: Requestable_enum_input<T>)        => new Requestable_enum(this.schema, p)
    enumOpt            = <const T extends KnownEnumNames>                 (p: Requestable_enumOpt_input<T>)     => new Requestable_enumOpt(this.schema, p)
    list               = <const T extends Requestable>                    (p: Requestable_list_input<T>)        => new Requestable_list(this.schema, p)
    groupOpt           = <const T extends { [key: string]: Requestable }> (p: Requestable_groupOpt_input<T>)    => new Requestable_groupOpt(this.schema, p)
    group              = <const T extends { [key: string]: Requestable }> (p: Requestable_group_input<T>)       => new Requestable_group(this.schema, p)
    selectOne          = <const T extends { type: string}>                (p: Requestable_selectOne_input<T>)   => new Requestable_selectOne(this.schema, p)
    selectMany         = <const T extends { type: string}>                (p: Requestable_selectMany_input<T>)  => new Requestable_selectMany(this.schema, p)

    // -------------------------------------
    ui                 = <const T extends { [key: string]: Requestable }> (p:T)                                 => new Requestable_group(this.schema, {items:p })

}

// // should this instanciate it's children automatically ?
// // should all forms be a group by default ? => yes ? => allow for reuse without nesting ?
// export class WidgetState<Req extends Requestable> {
//     //
//     constructor(
//         public req: Req,
//         public path: FormPath,
//         public draft: DraftL,
//     ) {
//         makeAutoObservable(this)
//     }

//     get result(): Req['$Output'] {
//         const state = this.state
//         if (state.type === 'bool') return state.val
//     }

//     // state ------------------------------
//     set = (next: Req['$State']) => this.draft.setAtPath(this.path, next)

//     get state(): Req['$State'] {
//         return (
//             this.draft.getAtPath(this.path) ?? //
//             this.defaultWidgetState //
//         )
//     }

//     get schema(): SchemaL { return this.draft.db.schema } // prettier-ignore

//     // prettier-ignore
//     private get defaultWidgetState(): ReqState<Req> {
//         const schema = this.schema
//         const req = this.req
//         return makeDefaultFor(schema, req)
//     }
// }
