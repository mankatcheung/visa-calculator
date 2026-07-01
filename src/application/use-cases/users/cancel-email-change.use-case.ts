import { IEmailChangeTokensRepository } from '@/src/application/repositories/email-change-tokens.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';

export type ICancelEmailChangeUseCase = ReturnType<
  typeof cancelEmailChangeUseCase
>;

export const cancelEmailChangeUseCase =
  (
    instrumentationService: IInstrumentationService,
    emailChangeTokensRepository: IEmailChangeTokensRepository
  ) =>
  async (userId: string): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'cancelEmailChange Use Case', op: 'function' },
      async () => {
        await emailChangeTokensRepository.deleteTokensByUserId(userId);
      }
    );
  };
