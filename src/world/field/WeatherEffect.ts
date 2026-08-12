/**
 * Port of kinoko's WeatherEffect (field weather cash-item state).
 * Tracks the active weather cash-item effect on a Field so it can be
 * expired on tick and re-sent to users entering the field.
 */
export class WeatherEffect {
  constructor(
    public readonly itemId: number,
    public readonly message: string,
    public readonly expireTime: Date,
  ) {}
}
