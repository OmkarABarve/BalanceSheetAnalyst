import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common'
import { alanceSheetService } from './balanceSheetService'
import { CreateBalanceSheetData } from '../../types'

@Controller('balance-sheets')
export class BalanceSheetController {
  constructor(private readonly balanceSheetService: BalanceSheetService) {}

  @Get()
  async getBalanceSheets(@Query('userId') userId: string) {
    return this.balanceSheetService.getBalanceSheets(userId)
  }

  @Get(':id')
  async getBalanceSheet(@Param('id') id: string) {
    return this.balanceSheetService.getBalanceSheet(id)
  }

  @Post()
  async createBalanceSheet(@Body() data: CreateBalanceSheetData) {
    return this.balanceSheetService.createBalanceSheet(data)
  }

  @Post('upload')
  async uploadBalanceSheet(
    @Body() file: Express.Multer.File,
    @Body('companyId') companyId: string,
    @Body('year') year: number
  ) {
    return this.balanceSheetService.uploadBalanceSheet(file, companyId, year)
  }
}
