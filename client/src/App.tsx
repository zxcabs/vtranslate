import './index.css'
import FileExplorer from './components/FileExplorer'
import JobEvents from './components/JobEvents.tsx/JobEvents'

function App() {
    return (
        <div className="min-h-screen bg-gray-100 ">
            <div className="flex flex-col gap-1">
                <JobEvents />

                <FileExplorer />
            </div>
        </div>
    )
}

export default App
