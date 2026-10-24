import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OutboxEvent } from './entities/outbox-event.entity.js';
import { SqsService } from '../sqs/sqs.service.js';

@Injectable()
export class OutboxProcessor
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(OutboxProcessor.name);
  private intervalo: ReturnType<typeof setInterval> | undefined;
  private processando = false;

  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepository: Repository<OutboxEvent>,
    private readonly sqsService: SqsService,
  ) {}

  onApplicationBootstrap(): void {
    void this.processarEventosPendentes();

    this.intervalo = setInterval(() => {
      void this.processarEventosPendentes();
    }, 5000);
  }

  onModuleDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  async processarEventosPendentes(): Promise<void> {
    if (this.processando) {
      return;
    }

    this.processando = true;

    try {
      const eventos = await this.outboxRepository.find({
        where: { published: false },
        order: { id: 'ASC' },
        take: 10,
      });

      for (const evento of eventos) {
        try {
          await this.sqsService.publicarEvento({
            eventId: evento.id,
            eventType: evento.eventType,
            payload: evento.payload,
          });

          evento.published = true;
          await this.outboxRepository.save(evento);

          this.logger.log(
            `Evento ${evento.id} publicado com sucesso.`,
          );
        } catch (erro) {
          this.logger.error(
            `Falha ao publicar o evento ${evento.id}. Ele continuará pendente.`,
            erro instanceof Error ? erro.stack : String(erro),
          );
        }
      }
    } catch (erro) {
      this.logger.error(
        'Falha ao consultar os eventos pendentes da Outbox.',
        erro instanceof Error ? erro.stack : String(erro),
      );
    } finally {
      this.processando = false;
    }
  }
}