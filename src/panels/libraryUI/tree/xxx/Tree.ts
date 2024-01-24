import { action, makeAutoObservable } from 'mobx'
import { STATE } from 'src/state/state'
import { TreeItemID } from '../TreeEntry'
import { NodeId, TreeNode } from './TreeNode'
import { FAIL, VIOLATION } from './utils'

export class Tree {
    topLevelNodes: TreeNode[] = []
    constructor(
        //
        public st: STATE,
        rootNodes: TreeItemID[],
    ) {
        for (let uid of rootNodes) {
            this.topLevelNodes.push(new TreeNode(this, uid, undefined))
        }
        makeAutoObservable(this, { indexNode: action })
    }

    get nodes(): TreeNode[] {
        return Array.from(this.nodeById.values())
    }

    // INDEXES ------------------------------------------------------
    /** get node by id */
    private nodeById = new Map<NodeId, TreeNode>()

    getNodeById = (nodeId: NodeId): TreeNode | undefined => this.nodeById.get(nodeId)

    /** every node created must call this function to register itself properly */
    indexNode = (n: TreeNode) => {
        this.indexNode_byId(n)
    }

    deleteNode = (n: TreeNode) => {
        const toDelete = n.get_descendant_and_self('bfs').reverse()
        for (const c of toDelete) this.deindexNode_byId(c)
    }

    // =============================================================================================
    // BY ID ---------------------------------------------
    private indexNode_byId = (n: TreeNode) => {
        const prevNodeById = this.nodeById.get(n.id)
        if (prevNodeById && prevNodeById !== n) FAIL(`different node pre-existing for this id: ${n.id}`)
        this.nodeById.set(n.id, n)
    }

    private deindexNode_byId = (n: TreeNode) => {
        const prevNodeById = this.nodeById.get(n.id)
        if (prevNodeById == null) VIOLATION('node was not properly indexed')
        if (prevNodeById !== n) VIOLATION('another node was indexed at this id')
        this.nodeById.delete(n.id)
    }
}
