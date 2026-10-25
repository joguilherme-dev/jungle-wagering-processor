import {
BadRequestException,
Injectable,
NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Bet } from './entities/bet.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { WalletLedgerEntry } from '../wallets/entities/wallet-ledger-entry.entity.js';
import { OutboxEvent } from '../outbox/entities/outbox-event.entity.js';
import { Money } from '../common/money/money.js';

@Injectable()
export class BetEventsService {
constructor(private readonly dataSource: DataSource) {}

async processarEvento(
eventType: string,
payload: {
betId: number;
walletId?: number;
amount?: string;
},
): Promise<void> {
if (!payload.betId) {
throw new BadRequestException('O evento precisa informar betId.');
}


await this.dataSource.transaction(async (manager) => {
  const betRepository = manager.getRepository(Bet);
  const walletRepository = manager.getRepository(Wallet);
  const ledgerRepository = manager.getRepository(WalletLedgerEntry);
  const outboxRepository = manager.getRepository(OutboxEvent);

  const aposta = await betRepository.findOne({
    where: { id: payload.betId },
    lock: { mode: 'pessimistic_write' },
  });

  if (!aposta) {
    throw new NotFoundException('Aposta não encontrada.');
  }

  const carteira = await walletRepository.findOne({
    where: { id: aposta.walletId },
    lock: { mode: 'pessimistic_write' },
  });

  if (!carteira) {
    throw new NotFoundException('Carteira não encontrada.');
  }

  if (eventType === 'LOSS') {
    if (aposta.status !== 'ACCEPTED') {
      throw new BadRequestException(
        'A aposta não está disponível para liquidação.',
      );
    }

    aposta.status = 'LOST';
    await betRepository.save(aposta);
  } else if (eventType === 'WIN') {
    if (aposta.status !== 'ACCEPTED') {
      throw new BadRequestException(
        'A aposta não está disponível para liquidação.',
      );
    }

    if (!payload.amount) {
      throw new BadRequestException('WIN precisa informar o valor do prêmio.');
    }

    const premio = Money.fromDecimal(payload.amount);
    const saldo = Money.fromDecimal(carteira.balance, true).add(premio);

    carteira.balance = saldo.toDecimal();
    aposta.status = 'WON';

    await walletRepository.save(carteira);
    await betRepository.save(aposta);

    await ledgerRepository.save(
      ledgerRepository.create({
        walletId: carteira.id,
        betId: aposta.id,
        entryType: 'WIN',
        amount: premio.toDecimal(),
      }),
    );
  } else if (eventType === 'REFUND') {
    if (aposta.status !== 'ACCEPTED') {
      throw new BadRequestException(
        'A aposta não está disponível para reembolso.',
      );
    }

    const valor = Money.fromDecimal(aposta.amount);
    const saldo = Money.fromDecimal(carteira.balance, true).add(valor);

    carteira.balance = saldo.toDecimal();
    aposta.status = 'REFUNDED';

    await walletRepository.save(carteira);
    await betRepository.save(aposta);

    await ledgerRepository.save(
      ledgerRepository.create({
        walletId: carteira.id,
        betId: aposta.id,
        entryType: 'REFUND',
        amount: valor.toDecimal(),
      }),
    );
  } else if (eventType === 'ROLLBACK') {
    throw new BadRequestException(
      'ROLLBACK exige identificar a operação financeira original.',
    );
  } else {
    throw new BadRequestException(
      `Tipo de evento não suportado: ${eventType}`,
    );
  }

  await outboxRepository.save(
    outboxRepository.create({
      eventType: `BET_${eventType}_PROCESSED`,
      payload: {
        betId: aposta.id,
        walletId: carteira.id,
        status: aposta.status,
      },
    }),
  );
});


}
}
