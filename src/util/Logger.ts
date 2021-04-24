import chalk from 'chalk'

export class Logger {
  public log(...args: any) {
    const time = new Date()
    console.log(`${chalk.bgBlue(`[${time.toLocaleTimeString()}]`)}`, ...args)
  }
}