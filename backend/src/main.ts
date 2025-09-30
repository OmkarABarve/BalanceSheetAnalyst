import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './appModule'
import 'reflect-metadata'


async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // Enable CORS for frontend
  
  
  // Global validation
  //app.useGlobalPipes(new ValidationPipe())
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow both ports
    credentials: true,
  })

  
  await app.listen(3001)
  console.log('Backend running on http://localhost:3001')
  console.log('Frontend running on http://localhost:3000')
  
}

bootstrap()
