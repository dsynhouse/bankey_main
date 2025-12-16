type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    [key: string]: any;
}

/**
 * Structured logger for the application
 * In production, logs are sent to console with structured format
 * Can be extended to send to external logging services
 */
class Logger {
    private isDev = import.meta.env.DEV;

    private log(level: LogLevel, message: string, context?: LogContext) {
        const timestamp = new Date().toISOString();
        const logData = {
            timestamp,
            level,
            message,
            ...context
        };

        if (this.isDev) {
            // Pretty print in development
            const emoji = {
                info: '📘',
                warn: '⚠️',
                error: '🚨',
                debug: '🐛'
            }[level];

            console[level === 'debug' ? 'log' : level](
                `${emoji} [${level.toUpperCase()}]`,
                message,
                context || ''
            );
        } else {
            // Structured logging in production
            console.log(JSON.stringify(logData));
        }
    }

    info(message: string, context?: LogContext) {
        this.log('info', message, context);
    }

    warn(message: string, context?: LogContext) {
        this.log('warn', message, context);
    }

    error(message: string, context?: LogContext) {
        this.log('error', message, context);
    }

    debug(message: string, context?: LogContext) {
        if (this.isDev) {
            this.log('debug', message, context);
        }
    }

    /**
     * Log performance metrics
     */
    performance(name: string, duration: number, metadata?: LogContext) {
        this.log('info', `Performance: ${name}`, {
            duration: `${duration.toFixed(2)}ms`,
            ...metadata
        });
    }
}

export const logger = new Logger();
