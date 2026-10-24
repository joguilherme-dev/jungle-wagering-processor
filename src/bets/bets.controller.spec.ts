import { Test, TestingModule } from '@nestjs/testing';
import { BetsController } from './bets.controller.js';
import { BetsService } from './bets.service.js';

describe('BetsController', () => {
  let controller: BetsController;

  const betsServiceMock = {
    listarApostas: vi.fn(),
    criarAposta: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [BetsController],
      providers: [
        {
          provide: BetsService,
          useValue: betsServiceMock,
        },
      ],
    }).compile();

    controller = moduleRef.get<BetsController>(BetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
