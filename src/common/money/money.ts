export class Money {
  private constructor(private readonly cents: bigint) {}

  static fromDecimal(value: string, allowZero = false): Money {
    const normalized = value.trim();

    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      throw new Error('Valor monetário inválido.');
    }

    const [integerPart, decimalPart = ''] = normalized.split('.');

    const cents =
      BigInt(integerPart) * 100n +
      BigInt(decimalPart.padEnd(2, '0'));

    if (cents < 0n || (!allowZero && cents === 0n)) {
      throw new Error(
        allowZero
          ? 'O saldo não pode ser negativo.'
          : 'O valor deve ser positivo.',
      );
    }

    return new Money(cents);
  }

  subtract(other: Money): Money {
    if (this.cents < other.cents) {
      throw new Error('Saldo insuficiente.');
    }

    return new Money(this.cents - other.cents);
  }

  toDecimal(): string {
    const integerPart = this.cents / 100n;
    const decimalPart = String(this.cents % 100n).padStart(2, '0');

    return `${integerPart}.${decimalPart}`;
  }

  isLessThan(other: Money): boolean {
    return this.cents < other.cents;
  }
}