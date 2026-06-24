export interface IEmailBloomFilterService {
  mightContainEmail(email: string): Promise<boolean>;
  recordEmail(email: string): Promise<void>;
}
