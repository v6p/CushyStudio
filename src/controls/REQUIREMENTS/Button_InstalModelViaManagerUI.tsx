import { observer } from 'mobx-react-lite'
import { useSt } from 'src/state/stateContext'
import { ModelInfo } from 'src/manager/model-list/model-list-loader-types'

export const Button_InstalModelViaManagerUI = observer(function Button_InstalModelViaManagerUI_(p: { modelInfo: ModelInfo }) {
    const mi = p.modelInfo
    const st = useSt()
    const host = st.mainHost
    const isInstalled = false // 🔴
    return (
        <div tw={[isInstalled ? 'bg-success-1' : null, 'flex flex-col virtualBorder p-2 bg-base-100 rounded']}>
            <div tw='flex items-center'>
                <span tw='font-bold whitespace-nowrap text-xl text-fuchsia-500'>
                    <span className='material-symbols-outlined'>model_training</span>
                </span>
                <div tw='font-bold'>MODEL: {mi.name}</div>
                {isInstalled ? '✅' : null}
                <div tw='flex-1'></div>
                <div
                    tw='btn btn-sm btn-outline btn-sm'
                    onClick={async () => {
                        // 🔴 TODO
                        // https://github.com/ltdrdata/ComfyUI-Manager/blob/main/js/model-downloader.js#L11
                        // copy Data-it implementation
                        // download file
                        const res = await host.manager.installModel(mi)
                        if (!res) return

                        // const res = await host.downloadFileIfMissing(m.url, dlPath)
                        // retrieve the enum info
                        // add the new value (BRITTLE)
                        // ⏸️ const enumInfo = st.schema.knownEnumsByName //
                        // ⏸️     .get(p.widget.input.enumName)
                        // ⏸️ enumInfo?.values.push(mi.filename)
                    }}
                >
                    <span className='material-symbols-outlined'>cloud_download</span>
                    <span>Install</span>
                </div>
            </div>
            <span tw='italic text-sm opacity-75 line-clamp-2'>
                {mi.description}
                {/* TODO: show install method by icon? */}
                {/* (via {plugin.install_type}) */}
            </span>
        </div>
    )
})
