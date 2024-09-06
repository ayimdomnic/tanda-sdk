export class BaseTandaException extends Error {
  constructor(message: string, code: number, options?: ErrorOptions) {
    super(message, options);
  }
}
