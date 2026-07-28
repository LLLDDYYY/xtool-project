"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const hbs_1 = require("hbs");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const database_1 = require("./database");
async function bootstrap() {
    await database_1.initDatabase();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        abortOnError: process.env.NODE_ENV !== 'development',
    });
    app.use(cookieParser());
    app.use(require("body-parser").json({ limit: '10mb' }));
    app.use(require("body-parser").urlencoded({ extended: true, limit: '10mb' }));
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, x-admin-token',
    });
    app.setBaseViewsDir((0, path_1.join)(process.cwd(), 'dist/client'));
    app.setViewEngine('html');
    app.engine('html', hbs_1.__express);
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'dist/client'), {
        prefix: '/',
        setHeaders: (res, path) => {
            if (path.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            }
        }
    });
    const logger = new common_1.Logger('Bootstrap');
    const host = process.env.SERVER_HOST || 'localhost';
    const port = Number(process.env.SERVER_PORT || '3000');
    await app.listen(port, host);
    logger.log(`Server running on http://${host}:${port}`);
    logger.log(`API endpoints ready at http://${host}:${port}/api`);
}
bootstrap();
