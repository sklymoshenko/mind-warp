import { Duration } from 'luxon'
import { Question, User } from '../types'

export type QuestionPopover = {
  id: Question['id']
  time: Question['timeAnswered']
  isCorrect: Question['isCorrect']
  user: User['name']
}

type Props = {
  question?: QuestionPopover
}

const AnsweredPopover = (props: Props) => {
  const formatTime = (seconds: number) => {
    return Duration.fromObject({ seconds }).toFormat('mm:ss')
  }
  return (
    <>
      {props.question && (
        <div class="flex w-fit gap-2 text-primary text-xl">
          <span>Answered by: {props.question.user}</span>|<span>Time: {formatTime(props.question.time)}</span>|
          <span classList={{ 'text-green-600': props.question.isCorrect!, 'text-red-600': !props.question.isCorrect! }}>
            {props.question.isCorrect ? 'Correct' : 'Incorrect'}
          </span>
        </div>
      )}
    </>
  )
}

export default AnsweredPopover
