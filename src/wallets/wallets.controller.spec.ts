import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WalletsController } from './wallets.controller.js';
import { Wallet } from './entities/wallet.entity.js';

describe('WalletsController', () => {
  let controller: WalletsController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [WalletsController],
      providers: [
        {
          provide: getRepositoryToken(Wallet),
          useValue: {},
        },
      ],
    }).compile();

    controller = moduleRef.get<WalletsController>(WalletsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
