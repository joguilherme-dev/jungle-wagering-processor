import { Injectable, Logger } from '@nestjs/common';
import {
DeleteMessageCommand,
ReceiveMessageCommand,
SQSClient,
} from '@aws-sdk/client-sqs';
import { createHash } from 'node:crypto';
import { InboxService } from '../inbox/inbox.service.js';

interface EventoRecebido {
eventId?: string | number;
eventType?: string;
type?: string;
payload?: unknown;
}

@Injectable()
export class SqsConsumerService {
private readonly logger = new Logger(SqsConsumerService.name);
private readonly consumerName = 'wagering-processor';

constructor(
private readonly sqsClient: SQSClient,
private readonly inboxService: InboxService,
) {}

private calcularHash(payload: string): string {
return createHash('sha256').update(payload).digest('hex');
}

async receberMensagens(queueUrl: string): Promise<void> {
const resposta = await this.sqsClient.send(
new ReceiveMessageCommand({
QueueUrl: queueUrl,
MaxNumberOfMessages: 10,
WaitTimeSeconds: 10,
VisibilityTimeout: 30,
}),
);


for (const mensagem of resposta.Messages ?? []) {
  if (!mensagem.Body || !mensagem.ReceiptHandle) {
    this.logger.warn('Mensagem sem Body ou ReceiptHandle.');
    continue;
  }

  try {
    const evento: unknown = JSON.parse(mensagem.Body);

    if (
      typeof evento !== 'object' ||
      evento === null ||
      Array.isArray(evento)
    ) {
      throw new Error('O corpo deve ser um objeto JSON.');
    }

    const dados = evento as EventoRecebido;
    const messageId = String(
      dados.eventId ?? mensagem.MessageId ?? '',
    );
    const eventType = dados.eventType ?? dados.type ?? 'UNKNOWN';
    const payloadHash = this.calcularHash(mensagem.Body);

    if (!messageId) {
      throw new Error('Mensagem sem identificador.');
    }

    const existente = await this.inboxService.buscarMensagem(
      this.consumerName,
      messageId,
    );

    if (existente?.completedAt) {
      await this.excluirMensagem(queueUrl, mensagem.ReceiptHandle);
      continue;
    }

    if (!existente) {
      const registrada = await this.inboxService.registrarMensagem({
        consumerName: this.consumerName,
        messageId,
        payloadHash,
        eventType,
      });

      if (!registrada) {
        this.logger.warn(`Mensagem duplicada: ${messageId}`);
        continue;
      }
    } else if (existente.payloadHash !== payloadHash) {
      throw new Error(
        `O identificador ${messageId} foi reutilizado com outro conteúdo.`,
      );
    }

   this.logger.log(
`Mensagem ${messageId} recebida (${eventType}).`,
);

if (eventType !== 'BET_ACCEPTED') {
throw new Error(`Tipo de evento ainda não implementado: ${eventType}`);
}

// O débito já foi realizado pelo BetsService.
// Não podemos descontar o saldo novamente.
await this.inboxService.concluirMensagem(
this.consumerName,
messageId,
);

await this.excluirMensagem(
queueUrl,
mensagem.ReceiptHandle,
);

this.logger.log(`Mensagem ${messageId} processada com sucesso.`);


    // O processamento financeiro será conectado antes de excluir a mensagem.
  } catch (erro) {
    this.logger.error(
      'Falha ao processar mensagem; ela não será excluída da fila.',
      erro instanceof Error ? erro.stack : String(erro),
    );
  }
}


}

async excluirMensagem(
queueUrl: string,
receiptHandle: string,
): Promise<void> {
await this.sqsClient.send(
new DeleteMessageCommand({
QueueUrl: queueUrl,
ReceiptHandle: receiptHandle,
}),
);
}
}
