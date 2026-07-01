import { IEmailChangeTokensRepository } from '@/src/application/repositories/email-change-tokens.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';

export type IGetPendingEmailChangeUseCase = ReturnType<
  typeof getPendingEmailChangeUseCase
>;

export const getPendingEmailChangeUseCase =
  (
    instrumentationService: IInstrumentationService,
    emailChangeTokensRepository: IEmailChangeTokensRepository
  ) =>
  async (userId: string): Promise<string | null> => {
    return await instrumentationService.startSpan(
      { name: 'getPendingEmailChange Use Case', op: 'function' },
      async () => {
        const token =
          await emailChangeTokensRepository.getActiveTokenByUserId(userId);
        return token ? token.pendingEmail : null;
      }
    );
  };
