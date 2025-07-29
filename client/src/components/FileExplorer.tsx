import React, { useState, useEffect } from 'react'
import { DirEntryType, type DirEntry, type DirEntryFile } from '../../../types/DirEntry.type'
import checkDirEntryIsVideo from '../../../utils/checkDirEntryIsVideo'
import FileInfo from './FileInfo'
import { getJSON } from '../api'

const FileExplorer: React.FC = () => {
    const [path, setPath] = useState<string>('/')
    const [entries, setEntries] = useState<DirEntry[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [oppenedFile, setOppenedFile] = useState<Record<string, boolean>>({})

    useEffect(() => {
        fetchDirectory(path)
        setOppenedFile({})
    }, [path])

    const fetchDirectory = async (dirPath: string) => {
        setLoading(true)
        setError(null)
        try {
            const list = await getJSON<DirEntry[]>('readdir', { path: dirPath })

            setEntries(list)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }



    const handleNavigate = (entry: DirEntry) => {
        const { type, name } = entry

        if (checkDirEntryIsVideo(entry)) {
            setOppenedFile((last) => ({
                ...last,
                [entry.name]: !last[entry.name]
            }))
        } else if (type === DirEntryType.Directory) {
            const newPath = path === '/'
                ? `/${name}`
                : `${path}/${name}`
            setPath(newPath)
        }
    }

    const goUp = () => {
        if (path === '/') return
        const upPath = path.split('/').slice(0, -1).join('/') || '/'
        setPath(upPath)
    }

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">File Explorer</h1>

            {/* Хлебные крошки */}
            <div className="mb-4">
                <button
                    onClick={goUp}
                    disabled={path === '/'}
                    className={`text-sm ${path === '/' ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
                >
                    🔼 Наверх
                </button>
            </div>

            <div className="font-mono text-sm text-gray-500 mb-2">Путь: {path}</div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                    Ошибка: {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-4">Загрузка...</div>
            ) : (
                <ul className="space-y-1">
                    {entries.length === 0 ? (
                        <li className="text-gray-500 text-sm">Папка пуста</li>
                    ) : (
                        entries.map((entry) => (
                            <li key={entry.name}>
                                <button
                                    onClick={() => handleNavigate(entry)}
                                    className={`w-full text-left px-3 py-2 rounded transition-colors bg-blue-50 text-blue-800 hover:bg-blue-100 cursor-pointer`}
                                >
                                    {entry.type === DirEntryType.Directory ? '📁' : '📄'} {entry.name}
                                    {entry.type === DirEntryType.File && oppenedFile[entry.name] ? <FileInfo entry={entry} /> : undefined}
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    )
}

export default FileExplorer 