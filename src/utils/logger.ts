import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = 'info') {
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    let formatted = `${prefix} ${message}`;
    if (data) {
      formatted += ` ${JSON.stringify(data, null, 2)}`;
    }

    return formatted;
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    console.log(chalk.gray(this.formatMessage('debug', message, data)));
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;
    console.log(chalk.blue(this.formatMessage('info', message, data)));
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;
    console.log(chalk.yellow(this.formatMessage('warn', message, data)));
  }

  error(message: string, data?: any): void {
    if (!this.shouldLog('error')) return;
    console.error(chalk.red(this.formatMessage('error', message, data)));
  }

  success(message: string, data?: any): void {
    console.log(chalk.green(this.formatMessage('info', message, data)));
  }
}

export const logger = new Logger();