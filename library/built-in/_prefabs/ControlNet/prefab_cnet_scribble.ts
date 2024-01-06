import type { FormBuilder, Runtime } from 'src'
import { Cnet_args, cnet_preprocessor_ui_common, cnet_ui_common } from '../prefab_cnet'
import { OutputFor } from '../_prefabs'

// 🅿️ Scribble FORM ===================================================
export const ui_subform_Scribble = () => {
    const form = getCurrentForm()
    return form.group({
        label: 'Scribble',
        customNodes: 'ComfyUI-Advanced-ControlNet',
        items: () => ({
            ...cnet_ui_common(form),
            preprocessor: ui_subform_Scribble_Preprocessor(),
            cnet_model_name: form.enum({
                enumName: 'Enum_ControlNetLoader_control_net_name',
                default: {
                    value: 'control_v11p_sd15_scribble.pth',
                    knownModel: ['ControlNet-v1-1 (scribble; fp16)'],
                },
                group: 'Controlnet',
                label: 'Model',
            }),
        }),
    })
}

export const ui_subform_Scribble_Preprocessor = () => {
    const form = getCurrentForm()
    return form.groupOpt({
        label: 'Scribble Preprocessor',
        default: true,
        items: () => ({
            advanced: form.groupOpt({
                label: 'Advanced Preprocessor Settings',
                items: () => ({
                    type: form.choice({
                        label: 'Type',
                        default: 'ScribbleLines',
                        items: () => ({
                            ScribbleLines: ui_subform_Scribble_Lines(),
                            FakeScribble: ui_subform_Fake_Scribble_Lines(),
                            XDOG: ui_subform_Scribble_XDoG_Lines(),
                        }),
                    }),
                    // TODO: Add support for auto-modifying the resolution based on other form selections
                    // TODO: Add support for auto-cropping
                }),
            }),
        }),
    })
}

export const ui_subform_Scribble_Lines = () => {
    const form = getCurrentForm()
    return form.group({
        label: 'Scribble Lines',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
        }),
    })
}

export const ui_subform_Fake_Scribble_Lines = () => {
    const form = getCurrentForm()
    return form.group({
        label: 'Fake Scribble Lines (aka scribble_hed)',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            safe: form.bool({ default: true }),
        }),
    })
}

export const ui_subform_Scribble_XDoG_Lines = () => {
    const form = getCurrentForm()
    return form.group({
        label: 'Scribble XDoG Lines ',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            threshold: form.int({ default: 32, min: 0, max: 64 }),
        }),
    })
}

// 🅿️ Scribble RUN ===================================================
export const run_cnet_Scribble = async (Scribble: OutputFor<typeof ui_subform_Scribble>, cnet_args: Cnet_args, image: IMAGE) => {
    const run = getCurrentRun()
    const graph = run.nodes
    const cnet_name = Scribble.cnet_model_name
    //crop the image to the right size
    //todo: make these editable
    image = graph.ImageScale({
        image,
        width: cnet_args.width ?? 512,
        height: cnet_args.height ?? 512,
        upscale_method: Scribble.advanced?.upscale_method ?? 'lanczos',
        crop: Scribble.advanced?.crop ?? 'center',
    })._IMAGE

    // PREPROCESSOR - Scribble ===========================================================
    if (Scribble.preprocessor) {
        if (Scribble.preprocessor.advanced?.type.FakeScribble) {
            const fake = Scribble.preprocessor.advanced?.type.FakeScribble
            image = graph.FakeScribblePreprocessor({
                image: image,
                resolution: fake.resolution,
                safe: fake.safe ? 'enable' : 'disable',
            })._IMAGE
            if (fake.saveProcessedImage) graph.SaveImage({ images: image, filename_prefix: 'cnet\\Scribble\\fake' })
            else graph.PreviewImage({ images: image })
        } else if (Scribble.preprocessor.advanced?.type.XDOG) {
            const xdog = Scribble.preprocessor.advanced.type.XDOG
            image = graph.Scribble$_XDoG$_Preprocessor({
                image: image,
                resolution: xdog.resolution,
                threshold: xdog.threshold,
            })._IMAGE
            if (xdog.saveProcessedImage) graph.SaveImage({ images: image, filename_prefix: 'cnet\\Scribble\\xdog' })
            else graph.PreviewImage({ images: image })
        } else {
            const scribble = Scribble.preprocessor.advanced?.type.ScribbleLines
            image = graph.ScribblePreprocessor({
                image: image,
                resolution: scribble?.resolution ?? 512,
            })._IMAGE
            if (scribble?.saveProcessedImage) graph.SaveImage({ images: image, filename_prefix: 'cnet\\Scribble\\scribble' })
            else graph.PreviewImage({ images: image })
        }
    }

    return { cnet_name, image }
}