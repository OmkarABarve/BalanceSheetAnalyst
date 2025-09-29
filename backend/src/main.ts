import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './appModule'
import 'reflect-metadata'


async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true,
  })
  
  // Global validation
  app.useGlobalPipes(new ValidationPipe())
  
  await app.listen(3001)
  console.log('Backend running on http://localhost:3001')
  
}

bootstrap()
