import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { User } from '@/src/entities/models/user';

export function getSelfUserPresenter(
  user: User,
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'getSelfUser Presenter', op: 'serialize' },
    () => ({
      id: user.id,
      email: user.email,
    })
  );
}

export type GetSelfUserPresenterOutput = ReturnType<typeof getSelfUserPresenter>;
