import log4js from 'log4js';

log4js.addLayout(
  'json',
  (logConfig: { separator: string }) => (logEvent: {
    categoryName: string;
    // eslint-disable-next-line id-denylist
    data: string[];
    level: { levelStr: string };
    status?: string;
    date?: Date;
    startTime?: Date;
    message?: string;
    extra?: unknown;
  }): string => {
    logEvent.status = logEvent.level.levelStr;
    logEvent.date = logEvent.startTime;
    delete logEvent.startTime;
    logEvent.message = `${logEvent.categoryName}: ${logEvent?.data[0]}`;
    if (logEvent.data.length > 1) {
      // eslint-disable-next-line prefer-destructuring
      logEvent.extra = logEvent.data[1];
    }
    return `${JSON.stringify(logEvent)}${logConfig.separator}`;
  },
);

const appenders: {
  defaultAppender: { type: string; layout: { type: string; separator: string } };
  logLevelFilter?: { type: string; level: string; appender: string };
} = {
  defaultAppender: {
    type: 'console',
    layout: { type: 'json', separator: ',' },
  },
};

const appendersList = ['defaultAppender'];

const level = 'info';

log4js.configure({
  appenders,
  categories: {
    default: {
      appenders: appendersList,
      level,
    },
  },
});

const logger = log4js.getLogger('GovFlow');

export default logger;
