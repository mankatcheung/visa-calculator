import { NextResponse } from 'next/server';

import { client } from '@/drizzle';
import { getInjection } from '@/di/container';

export async function GET() {
  try {
    await client.execute('select 1');
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    const crashReporterService = getInjection('ICrashReporterService');
    crashReporterService.report(error);
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
