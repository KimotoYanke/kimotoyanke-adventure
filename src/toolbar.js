// @flow
import chalk from 'chalk'
export default (state:{renderCounter:number}) => {
  return chalk.black.bgBlue('hjkl: Walk') + state.renderCounter
}
