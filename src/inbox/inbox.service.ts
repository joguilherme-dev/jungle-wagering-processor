import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InboxMessage } from './entities/inbox-message.entity.js';

@Injectable()
export class InboxService {
constructor(
@InjectRepository(InboxMessage)
private readonly inboxRepository: Repository<InboxMessage>,
) {}

async buscarMensagem(
consumerName: string,
messageId: string,
): Promise<InboxMessage | null> {
return this.inboxRepository.findOne({
where: { consumerName, messageId },
});
}

async registrarMensagem(
dados: Pick<
InboxMessage,
'consumerName' | 'messageId' | 'payloadHash' | 'eventType'
>,
): Promise<boolean> {
try {
await this.inboxRepository.insert(dados);
return true;
} catch (erro: unknown) {
const codigo =
typeof erro === 'object' && erro !== null && 'code' in erro
? erro.code
: undefined;


  if (codigo === '23505') {
    return false;
  }

  throw erro;
}


}

async concluirMensagem(
consumerName: string,
messageId: string,
): Promise<void> {
await this.inboxRepository.update(
{ consumerName, messageId },
{ completedAt: new Date() },
);
}
}
