import { useState } from 'react';
import { SelectSingleEventHandler } from 'react-day-picker';

import { Button } from '@/app/_components/ui/button';
import { Calendar } from '@/app/_components/ui/calendar';

type DatePickerProps = {
  value?: Date;
  onChange: SelectSingleEventHandler;
};

const BASE_YEAR = 2019;

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [mode, setMode] = useState<'year' | 'calendar'>('calendar');
  const [year, setYear] = useState<number>(
    value?.getUTCFullYear() || new Date().getUTCFullYear()
  );
  const [displayMonth, setDisplayMonth] = useState(value || new Date());
  const handleOnYearChange = (v: number) => {
    const newMonth = new Date(v, displayMonth.getUTCMonth());
    setYear(v);
    setDisplayMonth(newMonth);
    setMode('calendar');
  };
  const handleOnMonthChange = (d: Date) => {
    setYear(d.getUTCFullYear());
    setDisplayMonth(d);
  };
  return (
    <div className="flex flex-col items-center gap-2 my-3">
      {mode === 'calendar' && (
        <Button variant="outline" onClick={() => setMode('year')}>
          {year}
        </Button>
      )}
      {mode === 'year' && (
        <div className="grid grid-cols-4 gap-2 p-3">
          {[...Array(20).keys()].map((i) => (
            <Button
              key={i}
              variant={BASE_YEAR + i === year ? 'default' : 'outline'}
              value={`${BASE_YEAR + i}`}
              onClick={() => handleOnYearChange(BASE_YEAR + i)}
              size="sm"
            >{`${BASE_YEAR + i}`}</Button>
          ))}
        </div>
      )}
      {mode === 'calendar' && (
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={value}
          defaultMonth={value}
          month={displayMonth}
          onMonthChange={handleOnMonthChange}
          onSelect={onChange}
          initialFocus
        />
      )}
    </div>
  );
}
