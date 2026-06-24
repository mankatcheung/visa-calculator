import { BloomFilter } from 'bloom-filters';

import {
  BLOOM_FILTER_ERROR_RATE,
  BLOOM_FILTER_EXPECTED_EMAILS,
} from '@/config';

import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IEmailBloomFilterService } from '@/src/application/services/email-bloom-filter.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';

export class EmailBloomFilterService implements IEmailBloomFilterService {
  private readonly _filter = BloomFilter.create(
    BLOOM_FILTER_EXPECTED_EMAILS,
    BLOOM_FILTER_ERROR_RATE
  );
  private _warmupPromise: Promise<void> | undefined;

  constructor(
    private readonly _usersRepository: IUsersRepository,
    private readonly _instrumentationService: IInstrumentationService
  ) {}

  private _warmup(): Promise<void> {
    if (!this._warmupPromise) {
      this._warmupPromise = this._instrumentationService.startSpan(
        { name: 'EmailBloomFilterService > warmup' },
        async () => {
          const emails = await this._usersRepository.getAllEmails();
          emails.forEach((email) => this._filter.add(email));
        }
      );
    }
    return this._warmupPromise;
  }

  async mightContainEmail(email: string): Promise<boolean> {
    await this._warmup();
    return this._filter.has(email);
  }

  async recordEmail(email: string): Promise<void> {
    await this._warmup();
    this._filter.add(email);
  }
}
