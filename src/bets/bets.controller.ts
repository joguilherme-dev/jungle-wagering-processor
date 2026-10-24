import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  BadRequestException,
} from '@nestjs/common';

import { BetsService } from './bets.service.js';
import { CreateBetDto } from './dto/create-bet.dto.js';

@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Get()
  listarApostas() {
    return this.betsService.listarApostas();
  }

  @Post()
  criarAposta(
    @Body() dados: CreateBetDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException(
        'O cabeçalho Idempotency-Key é obrigatório.',
      );
    }

    return this.betsService.criarAposta(dados, idempotencyKey);
  }
}
