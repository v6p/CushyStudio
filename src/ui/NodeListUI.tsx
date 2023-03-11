import { observer } from 'mobx-react-lite'
import { comfyColors } from '../core/ComfyColors'
import { ComfyNodeJSON, ComfyPromptJSON } from '../core/ComfyPrompt'
import { ComfyNodeSchema } from '../core/ComfyNodeSchema'
import { ComfyNodeUID } from '../core/ComfyNodeUID'
import { NodeRefUI } from './NodeRefUI'
import { useSt } from './stContext'

export const NodeListUI = observer(function NodeListUI_(p: {}) {
    const st = useSt()
    const project = st.project
    const VERSIONS: ComfyPromptJSON[] = project.prompts
    const NODES: [uid: ComfyNodeUID, json: ComfyNodeJSON][] =
        project.focus in VERSIONS //
            ? Object.entries(VERSIONS[st.focus])
            : []
    return (
        <div className='col gap'>
            <div>Prompt {st.focus + 1}</div>
            {NODES.map(([uid, node]) => (
                <NodeUI key={uid} uid={uid} node={node} />
            ))}
        </div>
    )
})

export const NodeUI = observer(function NodeUI_(p: {
    //
    uid: ComfyNodeUID
    node: ComfyNodeJSON
}) {
    const st = useSt()
    const { uid, node } = p
    const curr = useSt().project.nodes.get(uid)!
    const name = curr.$schema.type
    const schema: ComfyNodeSchema = curr.$schema
    const color = comfyColors[schema.category]
    // const curr = project?.nodes.get(uid)
    return (
        <div key={uid} className='node'>
            <div className='row gap darker' style={{ backgroundColor: color, padding: '0.5rem' }}>
                <NodeRefUI nodeUID={uid} />
                <div>{name}</div>
            </div>
            <div>
                {schema.input.map((input) => {
                    let val = node.inputs[input.name]
                    if (Array.isArray(val)) val = <NodeRefUI nodeUID={val[0]} />
                    return (
                        <div key={input.name} className='prop row'>
                            <div className='propName'>{input.name}</div>
                            <div className='propValue'>{val}</div>
                        </div>
                    )
                })}
            </div>
            <div className='row wrap'>
                {curr.artifactsForStep(st.focus).map((url) => (
                    <div key={url}>
                        <img style={{ width: '5rem', height: '5rem' }} key={url} src={url} />
                    </div>
                ))}
                {/* {curr?.allArtifactsImgs.map((url) => (
                    <div key={url}>
                        <img style={{ width: '5rem', height: '5rem' }} key={url} src={url} />
                    </div>
                ))} */}
            </div>
        </div>
    )
})
