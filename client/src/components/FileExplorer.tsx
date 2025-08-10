import React, { useState, useEffect, useCallback } from 'react'
import { DirEntryType, type DirEntry } from '../../../types/DirEntry'
import checkDirEntryIsVideo from '../../../utils/checkDirEntryIsVideo'
import FileInfo from './FileInfo'
import { useSelector } from 'react-redux'
import {
    selectAllEntries,
    selectDirEntriesCurrentPath,
    selectDirEntriesError,
    selectDirEntriesStatus,
} from '../features/dirEntries/selectors.ts'
import { STATUS } from '../features/dirEntries/dirEntriesSlice.ts'
import { useAppDispatch } from '../hooks/useAppDispatch.ts'
import { fetchEntriesIfNeeded } from '../features/dirEntries/thunks.ts'

const FileExplorer: React.FC = () => {
    const dispatch = useAppDispatch()
    const entries = useSelector(selectAllEntries)
    const status = useSelector(selectDirEntriesStatus)
    const currentPath = useSelector(selectDirEntriesCurrentPath)
    const error = useSelector(selectDirEntriesError)
    const [oppenedFile, setOppenedFile] = useState<Record<string, boolean>>({})

    const navigateTo = useCallback(
        (path: string) => {
            dispatch(fetchEntriesIfNeeded(path))
            setOppenedFile({})
        },
        [dispatch],
    )

    const goUp = useCallback(() => {
        if (currentPath === '/') return
        const upPath = currentPath.split('/').slice(0, -1).join('/') || '/'
        navigateTo(upPath)
    }, [currentPath])

    const handleNavigate = useCallback(
        (entry: DirEntry) => {
            const { type, name } = entry
            if (checkDirEntryIsVideo(entry)) {
                setOppenedFile((last) => ({
                    ...last,
                    [entry.name]: !last[entry.name],
                }))
            } else if (type === DirEntryType.Directory) {
                const newPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`
                navigateTo(newPath)
            }
        },
        [navigateTo, currentPath],
    )

    useEffect(() => {
        navigateTo('/')
    }, [navigateTo])

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">File Explorer</h1>

            {/* Хлебные крошки */}
            <div className="mb-4">
                <button
                    onClick={goUp}
                    disabled={currentPath === '/'}
                    className={`text-sm ${currentPath === '/' ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
                >
                    🔼 Наверх
                </button>
            </div>

            <div className="font-mono text-sm text-gray-500 mb-2">Путь: {currentPath}</div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">Ошибка: {error}</div>}

            {status === STATUS.LOADING ? (
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
