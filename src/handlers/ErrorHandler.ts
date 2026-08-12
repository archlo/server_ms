export class ErrorHandler {
  static handleError(error: Error): void {
    console.error('[ErrorHandler]', error.message);
  }

  static handleException(exception: any): void {
    console.error('[ErrorHandler] Exception:', exception);
  }
}
