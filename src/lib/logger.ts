/**
 * Structured Logger (Pino-style)
 * Provides consistent logging with request context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    requestId?: string;
    userId?: string;
    component?: string;
    [key: string]: unknown;
}

interface LogEntry {
    level: LogLevel;
    timestamp: string;
    message: string;
    context?: LogContext;
    error?: {
        message: string;
        stack?: string;
        code?: string;
    };
}

class Logger {
    private context: LogContext = {};

    constructor(defaultContext?: LogContext) {
        this.context = defaultContext || {};
    }

    private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
        const entry: LogEntry = {
            level,
            timestamp: new Date().toISOString(),
            message,
            context: { ...this.context, ...context }
        };

        if (error) {
            entry.error = {
                message: error.message,
                stack: error.stack,
                code: (error as any).code
            };
        }

        // In production, this could be sent to a logging service
        // For now, output as JSON for structured log aggregation
        const output = JSON.stringify(entry);

        switch (level) {
            case 'debug':
                if (process.env.NODE_ENV === 'development') {
                    console.debug(output);
                }
                break;
            case 'info':
                console.info(output);
                break;
            case 'warn':
                console.warn(output);
                break;
            case 'error':
                console.error(output);
                break;
        }
    }

    debug(message: string, context?: LogContext) {
        this.log('debug', message, context);
    }

    info(message: string, context?: LogContext) {
        this.log('info', message, context);
    }

    warn(message: string, context?: LogContext) {
        this.log('warn', message, context);
    }

    error(message: string, error?: Error, context?: LogContext) {
        this.log('error', message, context, error);
    }

    // Create a child logger with additional context
    child(context: LogContext): Logger {
        const child = new Logger({ ...this.context, ...context });
        return child;
    }
}

// Default logger instance
export const logger = new Logger({ component: 'viralhook' });

// Convenience function to create request-scoped logger
export function createRequestLogger(requestId: string, userId?: string): Logger {
    return logger.child({ requestId, userId });
}
