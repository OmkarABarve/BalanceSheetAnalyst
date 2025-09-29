import { Controller, Get, Post, Query, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { BalanceSheetService } from './balanceSheetService'
import { CreateBalanceSheetData } from '../../types'

@Controller('balance-sheets')
export class BalanceSheetController {
  constructor(private readonly balanceSheetService: BalanceSheetService) {}

  @Get()
  async getBalanceSheets(@Query('userId') userId: string) {
    return this.balanceSheetService.getBalanceSheets(userId)
  }

  @Get(':id')
  async getBalanceSheet(
    @Param('id') id: string,
    @Query('userId') userId: string
  ) {
    return this.balanceSheetService.getBalanceSheet(id, userId)
  }

  @Post()
  async createBalanceSheet(
    @Body() data: CreateBalanceSheetData,
    @Query('userId') userId: string
  ) {
    return this.balanceSheetService.createBalanceSheet(data, userId)
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBalanceSheet(
    @UploadedFile() file: Express.Multer.File,
    @Body('companyId') companyId: string,
    @Body('year') year: number,
    @Query('userId') userId: string
  ) {
    return this.balanceSheetService.uploadBalanceSheet(file, companyId, year, userId)
  }
}
