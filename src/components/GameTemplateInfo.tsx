import { Game, GameTemplate } from '../types'

const GameTemplateInfo = (props: GameTemplate) => {
  //   const { get } = useApi(`games/template/${props.id}`)
  const themesCount = () => {
    return props.rounds.reduce((acc, round) => acc + round.themes.length, 0)
  }

  const questionsCount = () => {
    return props.rounds.reduce(
      (acc, round) => acc + round.themes.reduce((acc, theme) => acc + theme.questions.length, 0),
      0
    )
  }

  return (
    <div class="flex flex-col">
      <div class="flex flex-col gap-4">
        <span class="text-bold text-4xl">{props.name}</span>
        <span class="text-xl text-gray-500">{props.description}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-white text-lg">Rounds: {props.rounds.length}</span>
        <span class="text-white text-lg">Themes: {themesCount()}</span>
        <span class="text-white text-lg">Questions: {questionsCount()}</span>
      </div>
    </div>
  )
}

export default GameTemplateInfo
