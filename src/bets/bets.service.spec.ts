import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BetsService } from './bets.service.js';
import { Bet } from './entities/bet.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { WalletLedgerEntry } from '../wallets/entities/wallet-ledger-entry.entity.js';
import { OutboxEvent } from '../outbox/entities/outbox-event.entity.js';

describe('BetsService', () => {
  let service: BetsService;

  const apostaExistente = {
    id: 8,
    walletId: 7,
    amount: '10.00',
    idempotencyKey: 'teste-001',
    status: 'ACCEPTED',
  };

  const betRepositoryMock = {
    findOne: vi.fn(),
    create: vi.fn((dados) => dados),
    save: vi.fn(),
  };

  const walletRepositoryMock = {
    findOne: vi.fn(),
    save: vi.fn((dados) => Promise.resolve(dados)),
  };

  const ledgerRepositoryMock = {
    create: vi.fn((dados) => dados),
    save: vi.fn((dados) => Promise.resolve(dados)),
  };

  const outboxRepositoryMock = {
    create: vi.fn((dados) => dados),
    save: vi.fn((dados) => Promise.resolve(dados)),
  };

  const managerMock = {
    getRepository: vi.fn((entidade) => {
      if (entidade === Bet) {
        return betRepositoryMock;
      }

      if (entidade === Wallet) {
        return walletRepositoryMock;
      }

      if (entidade === WalletLedgerEntry) {
        return ledgerRepositoryMock;
      }

      if (entidade === OutboxEvent) {
        return outboxRepositoryMock;
      }

      return undefined;
    }),
  };

  const dataSourceMock = {
    transaction: vi.fn(async (callback) => callback(managerMock)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    betRepositoryMock.findOne.mockResolvedValue(null);

    walletRepositoryMock.findOne.mockResolvedValue({
      id: 7,
      balance: '100.00',
    });

    betRepositoryMock.create.mockImplementation((dados) => dados);

    betRepositoryMock.save.mockImplementation(async (dados) => ({
      id: 99,
      ...dados,
    }));

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        BetsService,
        {
          provide: getRepositoryToken(Bet),
          useValue: betRepositoryMock,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: walletRepositoryMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = moduleRef.get<BetsService>(BetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar a aposta existente quando a chave for repetida', async () => {
    betRepositoryMock.findOne.mockResolvedValue(apostaExistente);

    const resultado = await service.criarAposta(
      { walletId: 7, amount: '10.00' },
      'teste-001',
    );

    expect(resultado).toEqual(apostaExistente);

    expect(betRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { idempotencyKey: 'teste-001' },
    });

    expect(dataSourceMock.transaction).toHaveBeenCalledTimes(1);
    expect(walletRepositoryMock.save).not.toHaveBeenCalled();
    expect(ledgerRepositoryMock.save).not.toHaveBeenCalled();
    expect(outboxRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('deve rejeitar a mesma chave quando os dados forem diferentes', async () => {
    betRepositoryMock.findOne.mockResolvedValue(apostaExistente);

    await expect(
      service.criarAposta(
        { walletId: 7, amount: '20.00' },
        'teste-001',
      ),
    ).rejects.toMatchObject({
      status: 409,
    });

    expect(betRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { idempotencyKey: 'teste-001' },
    });
  });

  it('deve rejeitar uma aposta quando o saldo for insuficiente', async () => {
    betRepositoryMock.findOne.mockResolvedValue(null);

    walletRepositoryMock.findOne.mockResolvedValue({
      id: 7,
      balance: '50.00',
    });

    await expect(
      service.criarAposta(
        { walletId: 7, amount: '80.00' },
        'teste-saldo-insuficiente',
      ),
    ).rejects.toMatchObject({
      status: 400,
    });

    expect(walletRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 7 },
      lock: { mode: 'pessimistic_write' },
    });

    expect(walletRepositoryMock.save).not.toHaveBeenCalled();
    expect(ledgerRepositoryMock.save).not.toHaveBeenCalled();
    expect(outboxRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('deve rejeitar uma aposta quando a carteira não existir', async () => {
    betRepositoryMock.findOne.mockResolvedValue(null);
    walletRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.criarAposta(
        { walletId: 999, amount: '10.00' },
        'teste-carteira-inexistente',
      ),
    ).rejects.toMatchObject({
      status: 404,
    });

    expect(walletRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 999 },
      lock: { mode: 'pessimistic_write' },
    });

    expect(betRepositoryMock.save).not.toHaveBeenCalled();
    expect(ledgerRepositoryMock.save).not.toHaveBeenCalled();
    expect(outboxRepositoryMock.save).not.toHaveBeenCalled();
  });

  it.each([
    ['zero', '0.00'],
    ['negativo', '-10.00'],
    ['com mais de duas casas decimais', '10.999'],
  ])(
    'deve rejeitar uma aposta com valor %s',
    async (_descricao, valor) => {
      await expect(
        service.criarAposta(
          { walletId: 7, amount: valor },
          `teste-valor-${valor}`,
        ),
      ).rejects.toMatchObject({
        status: 400,
      });

      expect(dataSourceMock.transaction).not.toHaveBeenCalled();
    },
  );

  it('deve registrar o evento BET_ACCEPTED na Outbox', async () => {
    const resultado = await service.criarAposta(
      { walletId: 7, amount: '10.00' },
      'teste-outbox-001',
    );

    expect(resultado.id).toBe(99);

    expect(outboxRepositoryMock.create).toHaveBeenCalledWith({
      eventType: 'BET_ACCEPTED',
      payload: {
        betId: 99,
        walletId: 7,
        amount: '10.00',
        status: 'ACCEPTED',
      },
    });

    expect(outboxRepositoryMock.save).toHaveBeenCalledTimes(1);
  });
});