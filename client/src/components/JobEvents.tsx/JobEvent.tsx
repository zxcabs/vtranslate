import { useSelector } from 'react-redux'
import { WSQueueEvent } from '../../../../types/WSQueueEvent'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { selectById } from '../../features/Jobs/selectors'
import { RootState } from '../../store'
import { useEffect } from 'react'
import { fetchJobIfNeeded } from '../../features/Jobs/thunks'

interface Props {
    jobEvent: WSQueueEvent
}

const JobEvent: React.FC<Props> = ({ jobEvent }) => {
    const dispatch = useAppDispatch()
    const jobEntity = useSelector((state: RootState) => selectById(state, jobEvent.jobId))

    useEffect(() => {
        dispatch(fetchJobIfNeeded(jobEvent))
    }, [jobEvent])

    if (jobEvent.event === 'progress')
        return (
            <div>
                {jobEvent.service}
                {jobEntity?.job ? ` - ${jobEntity.job.data.path}` : null} - {jobEvent.event} - {jobEvent.progress}
            </div>
        )

    if (jobEvent.event === 'failed')
        return (
            <div>
                {jobEvent.service}
                {jobEntity?.job ? ` - ${jobEntity.job.data.path}` : null} - {jobEvent.event} - {jobEvent.reason}
            </div>
        )

    return (
        <div>
            {jobEvent.service} {jobEntity?.job ? ` - ${jobEntity.job.data.path}` : null} - {jobEvent.event}
        </div>
    )
}

export default JobEvent
