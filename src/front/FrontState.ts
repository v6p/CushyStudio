import type { ComfyStatus } from '../types/ComfyWsApi'

import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'
import { ImageInfos, ImageUID } from '../core/GeneratedImageSummary'
import { Graph } from '../core/Graph'
import { ActionRef } from '../core/KnownWorkflow'
import { Schema } from '../core/Schema'
import { logger } from '../logger/logger'
import {
    FromExtension_CushyStatus,
    FromExtension_ask,
    MessageFromExtensionToWebview,
    MessageFromWebviewToExtension,
} from '../types/MessageFromExtensionToWebview'
import { LightBoxState } from '../ui/LightBox'
import { renderMsgUI } from '../ui/flow/flowRenderer1'
import { exhaust } from '../utils/ComfyUtils'
import { Maybe } from '../utils/types'
import { CushyDB } from './FrontDB'
import { ResilientSocketToExtension } from './ResilientCushySocket'
import { UIAction } from './UIAction'
import { ActionDefinitionID } from 'src/back/FlowDefinition'
import { FrontFlow } from './FrontFlow'

export type MsgGroup = {
    groupType: string
    messages: MessageFromExtensionToWebview[]
    uis: JSX.Element[]
    wrap: boolean
}

const newMsgGroup = (groupType: string, wrap?: boolean): MsgGroup => ({
    groupType,
    messages: [],
    uis: [],
    wrap: wrap ?? false,
})

export class FrontState {
    uid = nanoid()
    hovered: Maybe<ImageInfos> = null
    lightBox = new LightBoxState(() => this.images, true)

    get received(): MessageFromExtensionToWebview[] {
        return this.db.data.msgs.map((x) => x.msg)
    }

    // --------------------------
    flows = new Map<string, FrontFlow>()
    startFlow = (): FrontFlow => {
        const flow = new FrontFlow()
        this.flows.set(flow.id, flow)
        return flow
    }
    get flowArray() { return Array.from(this.flows.values()) } // prettier-ignore
    // --------------------------

    expandNodes: boolean = false
    flowDirection: 'down' | 'up' = 'up'
    showAllMessageReceived: boolean = false
    currentAction: UIAction | null = null

    get itemsToShow() {
        // return this.received
        const max = 200
        const len = this.received.length
        const start = this.showAllMessageReceived ? 0 : Math.max(0, len - max)
        const items = this.received.slice(start)
        const ordered = this.flowDirection === 'up' ? items.reverse() : items
        return ordered
    }

    // group sequential items with similar types together
    get groupItemsToShow(): MsgGroup[] {
        const ordered = this.itemsToShow

        const grouped: MsgGroup[] = []
        let currentGroup: MsgGroup | null = null
        let currentType: string | null = null
        for (const item of ordered) {
            let x = renderMsgUI(item)
            if (x == null) continue
            let groupType = x.group ?? item.type
            // if (currentGroup == null) currentGroup = newMsgGroup(groupType, x.wrap)
            if (groupType !== currentType) {
                if (currentGroup?.messages.length) grouped.push(currentGroup)
                currentGroup = newMsgGroup(groupType, x.wrap)
                currentType = groupType
            }
            currentGroup!.messages.push(item)
            currentGroup!.uis.push(x.ui)
        }
        if (currentGroup?.messages.length) grouped.push(currentGroup)
        return grouped
    }

    activeTab: 'view' | 'segment' | 'import' | 'paint' = 'view'
    setActiveTab = (tab: 'view' | 'segment' | 'import' | 'paint') => {
        this.activeTab = tab
    }

    // this is the new way
    answerInfo = (value: any) => this.sendMessageToExtension({ type: 'answer', value })

    gallerySize: number = 256
    cushySocket: ResilientSocketToExtension
    constructor() {
        // if (typeof acquireVsCodeApi === 'function') this.vsCodeApi = acquireVsCodeApi()
        // console.log('a')
        this.cushySocket = new ResilientSocketToExtension({
            url: () => 'ws://localhost:8388',
            onConnectOrReconnect: () => {
                this.sendMessageToExtension({ type: 'say-ready', frontID: this.uid })
                // toaster.push('Connected to CushyStudio')
            },
            onMessage: (msg) => {
                // console.log('received', msg.data)
                const json = JSON.parse(msg.data)
                this.onMessageFromExtension(json)
            },
        })
        // console.log('b')

        makeAutoObservable(this)
        // window.addEventListener('message', this.onMessageFromExtension)
        // this.sendMessageToExtension({ type: 'say-ready', frontID: this.uid })
    }

    graph: Maybe<Graph> = null
    schema: Maybe<Schema> = null
    images: ImageInfos[] = []
    imagesById: Map<ImageUID, ImageInfos> = new Map()
    get imageReversed() {
        return this.images.slice().reverse()
    }

    sid: Maybe<string> = null
    comfyStatus: Maybe<ComfyStatus> = null
    cushyStatus: Maybe<FromExtension_CushyStatus> = null
    knownActions = new Map<ActionDefinitionID, ActionRef>()
    get ActionOptionForSelectInput() {
        return Array.from(this.knownActions.values()).map((x) => ({ value: x.id, label: x.name }))
    }
    selectedWorkflowID: Maybe<ActionRef['id']> = null
    runningFlow: Maybe<FrontFlow> = null

    // runs: { flowRunId: string; graph: Graph }[]
    XXXX = new Map<MessageFromExtensionToWebview['uid'], Graph>()

    pendingAsk: FromExtension_ask[] = []

    db: CushyDB = new CushyDB(this)

    private recordImages = (imgs: ImageInfos[]) => {
        this.images.push(...imgs)
        for (const img of imgs) this.imagesById.set(img.uid, img)
    }

    /** this is for the UI only; process should be very thin / small */
    onMessageFromExtension = (message: MessageFromExtensionToWebview) => {
        // 1. enqueue the message
        const msg: MessageFromExtensionToWebview =
            typeof message === 'string' //
                ? JSON.parse(message)
                : message

        // this message must not be logged
        if (msg.type === 'sync-history') {
            this.db.data = msg.history
            for (const msg of this.db.data.msgs) {
                if (!(msg.msg.type === 'images')) continue
                this.recordImages(msg.msg.images)
            }
            // this.db.createFolder()
            // this.db.createFolder()
            return
        }

        console.log('💬', msg.type) //, { message })

        this.db.data.msgs.push({ at: Date.now(), msg })

        // 2. process the info
        if (msg.type === 'action-code') return
        if (msg.type === 'ask') {
            this.pendingAsk.push(msg)
            return
        }
        if (msg.type === 'show-html') {
            return
        }

        if (msg.type === 'print') {
            this.runningFlow?.history.push(msg)
            return
        }
        if (msg.type === 'action-start') {
            // 🔴
            // const newFlow = new FrontFlow(msg.flowRunID)
            // this.flows.set(msg.flowRunID, newFlow)
            // this.runningFlow = newFlow
            return
        }
        if (msg.type === 'action-end') {
            this.runningFlow = null
            return
        }

        if (msg.type === 'schema') {
            this.schema = new Schema(msg.schema, msg.embeddings)
            return
        }

        if (msg.type === 'status') {
            if (msg.data.sid) this.sid = msg.data.sid
            this.comfyStatus = msg.data.status
            return
        }
        if (msg.type === 'execution_cached') return // 🔴

        if (msg.type === 'prompt') {
            if (this.schema == null) throw new Error('missing schema')
            this.graph = new Graph(this.schema, msg.graph)
            return
        }

        if (msg.type === 'images') return this.recordImages(msg.images)

        if (msg.type === 'ls') {
            console.log(msg)
            let firstKnownActionID = msg.actions[0]?.id
            for (const a of msg.actions) this.knownActions.set(a.id, a)
            if (this.selectedWorkflowID == null && firstKnownActionID) this.selectedWorkflowID = firstKnownActionID
            return
        }

        if (msg.type === 'cushy_status') {
            this.cushyStatus = msg
            return
        }

        const graph = this.graph
        if (graph == null) throw new Error('missing graph')

        // defer accumulation to ScriptStep_prompt
        if (msg.type === 'progress') {
            logger().debug(`🐰 ${msg.type} ${JSON.stringify(msg.data)}`)
            return graph.onProgress(msg)
        }

        if (msg.type === 'executing') {
            if (graph == null) throw new Error('missing graph')
            this.XXXX.set(msg.uid, graph)
            if (msg.data.node == null) this.graph = null // done
            logger().debug(`🐰 ${msg.type} ${JSON.stringify(msg.data)}`)
            return graph.onExecuting(msg)
        }

        if (msg.type === 'executed') {
            logger().info(`${msg.type} ${JSON.stringify(msg.data)}`)
            // return graph.onExecuted(msg)
            return
        }

        exhaust(msg)
    }

    /** Post a message (i.e. send arbitrary data) to the owner of the webview (the extension).
     * @remarks When running webview code inside a web browser, postMessage will instead log the given message to the console.
     */
    public sendMessageToExtension(message: MessageFromWebviewToExtension) {
        this.cushySocket.send(JSON.stringify(message))
        // else console.log(message)
    }
}
