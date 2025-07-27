// src/components/FileExplorer.tsx
import React, { useState, useEffect } from 'react';

interface DirEntry {
  name: string;
  type: 'file' | 'directory';
}

const FileExplorer: React.FC = () => {
  const [path, setPath] = useState<string>('/');
  const [entries, setEntries] = useState<DirEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = '/api'; // Замени на свой бэкенд

  useEffect(() => {
    fetchDirectory(path);
  }, [path]);

  const fetchDirectory = async (dirPath: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/readdir?path=${encodeURIComponent(dirPath)}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to load directory');
      }
      const data: string[] = await response.json();

      // Преобразуем в объекты с типом (в твоём API можно улучшить, чтобы возвращал тип)
      const list: DirEntry[] = data.map((name) => {
        // Пока просто догадаемся по отсутствию точки — можно улучшить на бэкенде
        const type = name.includes('.') ? 'file' : 'directory';
        return { name, type };
      });

      setEntries(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (name: string, type: 'file' | 'directory') => {
    if (type === 'file') return; // клик по файлу — ничего не делаем (можно открыть, скачать и т.д.)
    
    const newPath = path === '/' 
      ? `/${name}` 
      : `${path}/${name}`;
    setPath(newPath);
  };

  const goUp = () => {
    if (path === '/') return;
    const upPath = path.split('/').slice(0, -1).join('/') || '/';
    setPath(upPath);
  };

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
                  onClick={() => handleNavigate(entry.name, entry.type)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    entry.type === 'directory'
                      ? 'bg-blue-50 text-blue-800 hover:bg-blue-100 cursor-pointer'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-default'
                  }`}
                >
                  {entry.type === 'directory' ? '📁' : '📄'} {entry.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default FileExplorer;