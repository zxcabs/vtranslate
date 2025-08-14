import { WSQueueEvent } from '../../../../types/WSQueueEvent'

interface Props {
    jobEvent: WSQueueEvent
}

const JobEvent: React.FC<Props> = ({ jobEvent }) => {
    if (jobEvent.event === 'progress')
        return (
            <div>
                {jobEvent.jobId} - {jobEvent.event} - {jobEvent.progress}
            </div>
        )

    if (jobEvent.event === 'failed')
        return (
            <div>
                {jobEvent.jobId} - {jobEvent.event} - {jobEvent.reason}
            </div>
        )

    return (
        <div>
            {jobEvent.jobId} - {jobEvent.event}
        </div>
    )
}

export default JobEvent
