import { Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity.js';

@Controller('wallets')
export class WalletsController {
constructor(
@InjectRepository(Wallet)
private readonly walletRepository: Repository<Wallet>,
) {}

@Get()
listarCarteiras() {
return this.walletRepository.find();
}

@Post()
criarCarteira() {
  return this.walletRepository.save(
    this.walletRepository.create({ balance: '0.00' }),
  );
}
}
