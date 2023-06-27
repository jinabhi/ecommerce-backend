/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import methodOverride from 'method-override';
import helmet from 'helmet';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import schedule from 'node-schedule';
import routes from './routes';
import models from './models';
import config from './config';
import loggers from './services/logger.service';
import appVersionMiddleware from './middlewares/appVersion.middleware';
import scheduleJob from './services/scheduleJob.service';
import awsSecret from './aws-secret';

/**
 * Application startup class
 *
 * @export
 * @class Bootstrap
 */
export default class Bootstrap {
  /**
   * Creates an instance of Bootstrap.
   * @param {object} app
   *
   * @memberOf Bootstrap
   */
  constructor(app) {
    this.app = app;
    this.middleware();
    this.connectDb();
    this.routes();
    this.start();
  }

  /**
   * Load all middleware
   * @memberOf Bootstrap
   */
  middleware() {
    const { app } = this;
    const swaggerDefinition = {
      info: {
        title: 'REST API for morluxury Application',
        version: '1.0.0',
        description: 'This is the REST API for morluxury Application',
      },
      host: `${config.app.swaggerHost}`,
      basePath: '/api',
      securityDefinitions: {
        BearerAuth: {
          type: 'apiKey',
          description: 'JWT authorization of an API',
          name: 'Authorization',
          in: 'header',
        },
      },
    };

    const options = {
      swaggerDefinition,
      apis: ['./api-docs/*.yaml'],
    };

    const swaggerSpec = swaggerJSDoc(options);
    app.use(
      cors({
        'Access-Control-Allow-Origin': `https://${config.app.swaggerHost}`,
      }),
    );
    app.use(bodyParser.json({ limit: '500mb', extended: true }));
    app.use(compression());
    app.use(methodOverride());
    app.use(helmet());
    app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));
    app.use(
      helmet({
        referrerPolicy: { policy: 'no-referrer' },
      }),
    );
    app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
    if (config.app.swaggerEnv === 'development') {
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }
    app.use('/assets', express.static(`${__dirname}/uploads`));
    app.use('/images', express.static(`${__dirname}/images`));
    app.use('/public', express.static(`${__dirname}/../public`));
    app.use(express.static(path.join(`${__dirname}/../build`)));

    app.use((req, res, next) => {
      if (req.secure) {
        config.app.setBaseUrl(`https://${req.headers.host}/`);
      } else {
        config.app.setBaseUrl(`http://${req.headers.host}/`);
      }
      next();
    });
    app.use('/api/', appVersionMiddleware);
  }

  /**
   * Check database connection
   * @memberOf Bootstrap
   */
  connectDb() {
    const {
      sequelize,
    } = models;
    sequelize
      .beforeConnect(async (dbConfig) => {
        if (!dbConfig.host && process.env.SECRET_MANAGER_ENV === 'production') {
          await awsSecret();
          config.resetAll();
          dbConfig.database = config.database.mysql.db;
          dbConfig.username = config.database.mysql.user;
          dbConfig.password = config.database.mysql.password;
          dbConfig.host = config.database.mysql.host;
          dbConfig.port = config.database.mysql.port;
        }
      });
    sequelize.authenticate()
      .then(async () => {
        console.log('Database connected successfully');
        loggers.info('Database connected successfully');
        await sequelize
          .sync()
          .then(() => {
            // console.log('Database sync successfully');
          })
          .catch((error) => {
            // console.log('Database syncing error %s', error);
            loggers.info('Database syncing error %s', error);
          });
      })
      .catch((error) => {
        // console.log('Database authenticating error %s', error);
        loggers.info('Database syncing error %s', error);
      });
  }

  /**
   * Load all routes
   * @memberOf Bootstrap
   */
  routes() {
    routes(this.app);
  }

  /**
   * Start express server
   * @memberOf Bootstrap
   */
  start() {
    const { app } = this;
    const port = app.get('port');
    app.listen(port, () => { });
    // delete unused media from media temp
    // if (config.app.environment === 'production') {
    this.scheduleJob();
    // }
  }

  /**
   * Execute schedule job
   * @memberOf Bootstrap
   */
  // eslint-disable-next-line class-methods-use-this
  scheduleJob() {
    // Every minute
    schedule.scheduleJob('* */1 * * *', scheduleJob.everyMinute);

    // Every five minute
    schedule.scheduleJob('* */5 * * *', scheduleJob.everyFiveMinute);

    // Every night 12'o clock
    schedule.scheduleJob('0 0 * * *', scheduleJob.everyDay);

    // Every three hour
    schedule.scheduleJob('* */6 * * * ', scheduleJob.everyThreeHour);
  }
}
