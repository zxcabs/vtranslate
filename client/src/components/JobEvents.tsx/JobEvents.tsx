import React from 'react'
import { useSelector } from 'react-redux'
import { selectAll } from '../../features/queueEvents/selectors'
import JobEvent from './JoBEvent'

const JobEvents: React.FC = () => {
    const jobEvents = useSelector(selectAll)

    if (jobEvents.length === 0) return null

    return (
        <div className="p-6 w-full mx-auto bg-white shadow-lg rounded-lg">
            {jobEvents.map((jobEvent) => (
                <JobEvent jobEvent={jobEvent} key={jobEvent.jobId} />
            ))}
        </div>
    )
}

export default JobEvents
