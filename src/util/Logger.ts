import chalk from 'chalk'

export class Logger {
  public log(message: any, prefix?: string) {
    const time = new Date()
    console.log(`${chalk.bgBlue(`[${time.toLocaleTimeString()}]`)}${prefix ? chalk.bgYellow(`[${prefix}]`) : ''}`, message)
  }
}