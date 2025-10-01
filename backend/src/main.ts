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
    origin: [
      process.env.FRONTEND_ORIGIN,
      'http://localhost:3000', 
      'http://localhost:5173',
      'https://balancesheetanalyst.netlify.app'
    ].filter(Boolean),
    credentials: true,
  })
  
  const port = Number(process.env.PORT) || 3001
  await app.listen(port, '0.0.0.0')
  
  console.log(`Backend running on port ${port}`)
  console.log('Frontend origin:', process.env.FRONTEND_ORIGIN || 'localhost')
  
}

bootstrap()
