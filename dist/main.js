"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('KeeperPOS-Server');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Keeper POS — API Documentation')
        .setDescription('Enterprise Point of Sale, Inventory Management, Customer Ledger, and Financial Analytics REST API Service powered by NestJS & MongoDB.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`=============================================================`);
    logger.log(`🚀 Keeper POS Backend Server is running on: http://localhost:${port}`);
    logger.log(`📊 Web Application Dashboard UI: http://localhost:${port}/`);
    logger.log(`📜 Interactive Swagger API Docs: http://localhost:${port}/api/docs`);
    logger.log(`=============================================================`);
}
bootstrap();
//# sourceMappingURL=main.js.map