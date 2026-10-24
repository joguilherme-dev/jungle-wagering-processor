import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OutboxEvent } from '../outbox/entities/outbox-event.entity.js';
import { Bet } from './entities/bet.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { WalletLedgerEntry } from '../wallets/entities/wallet-ledger-entry.entity.js';
import { CreateBetDto } from './dto/create-bet.dto.js';
import { Money } from '../common/money/money.js';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,

    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    private readonly dataSource: DataSource,
  ) {}

  listarApostas() {
    return this.betRepository.find();
  }

  async criarAposta(dados: CreateBetDto, idempotencyKey: string) {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException(
        'A chave de idempotência é obrigatória.',
      );
    }

    let valor: Money;

    try {
      valor = Money.fromDecimal(dados.amount);
    } catch {
      throw new BadRequestException(
        'O valor da aposta deve ser positivo e ter no máximo duas casas decimais.',
      );
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const betRepository = manager.getRepository(Bet);
        const walletRepository = manager.getRepository(Wallet);
        const ledgerRepository = manager.getRepository(WalletLedgerEntry);

        const apostaExistente = await betRepository.findOne({
          where: { idempotencyKey },
        });

        if (apostaExistente) {
          if (
            apostaExistente.walletId !== dados.walletId ||
            Money.fromDecimal(apostaExistente.amount).toDecimal() !==
              valor.toDecimal()
          ) {
            throw new ConflictException(
              'Esta chave de idempotência já foi usada com dados diferentes.',
            );
          }

          return apostaExistente;
        }

        const carteira = await walletRepository.findOne({
          where: { id: dados.walletId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!carteira) {
          throw new NotFoundException('Carteira não encontrada.');
        }

        let novoSaldo: Money;

        try {
          novoSaldo = Money.fromDecimal(carteira.balance, true).subtract(valor);
        } catch (erro) {
          if (
            erro instanceof Error &&
            erro.message === 'Saldo insuficiente.'
          ) {
            throw new BadRequestException('Saldo insuficiente.');
          }

          throw erro;
        }

        carteira.balance = novoSaldo.toDecimal();
        await walletRepository.save(carteira);

        const aposta = betRepository.create({
          walletId: carteira.id,
          amount: valor.toDecimal(),
          idempotencyKey,
          status: 'ACCEPTED',
        });

        const apostaSalva = await betRepository.save(aposta);

        const entradaLedger = ledgerRepository.create({
          walletId: carteira.id,
          betId: apostaSalva.id,
          entryType: 'BET',
          amount: valor.toDecimal(),
        });

        await ledgerRepository.save(entradaLedger);

const outboxRepository = manager.getRepository(OutboxEvent);

const evento = outboxRepository.create({
  eventType: 'BET_ACCEPTED',
  payload: {
    betId: apostaSalva.id,
    walletId: carteira.id,
    amount: valor.toDecimal(),
    status: apostaSalva.status,
  },
});

await outboxRepository.save(evento);

return apostaSalva;
      });
    } catch (erro) {
      if (
        erro instanceof Error &&
        'code' in erro &&
        erro.code === '23505'
      ) {
        const apostaExistente = await this.betRepository.findOne({
          where: { idempotencyKey },
        });

        if (apostaExistente) {
          if (
            apostaExistente.walletId !== dados.walletId ||
            Money.fromDecimal(apostaExistente.amount).toDecimal() !==
              valor.toDecimal()
          ) {
            throw new ConflictException(
              'Esta chave de idempotência já foi usada com dados diferentes.',
            );
          }

          return apostaExistente;
        }
      }

      throw erro;
    }
  }
}