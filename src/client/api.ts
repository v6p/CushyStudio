import type { NodeUID } from '../core/runtime'

// REQUEST PAYLOADS ------------------------------------------------
export type ApiPromptInput = {
    client_id: string
    extra_data: { extra_pnginfo: any }
    prompt: any
}

// LIVE UPDATES -----------------------------------------------------
export type WsMsg = WsMsgStatus | WsMsgProgress | WsMsgExecuting | WsMsgExecuted

export type WsMsgStatus = { type: 'status'; data: { sid?: string; status: ComfyStatus } }
export type WsMsgProgress = { type: 'progress'; data: NodeProgress }
export type WsMsgExecuting = { type: 'executing'; data: { node: NodeUID } }
export type WsMsgExecuted = { type: 'executed'; data: { node: NodeUID; output: { images: string[] } } }

export type NodeProgress = { value: number; max: number }
export type ComfyStatus = { exec_info: { queue_remaining: number } }
