import { format, startOfToday } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/app/_components/ui/button';
import { Calendar } from '@/app/_components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/_components/ui/popover';
import { Separator } from '@/app/_components/ui/separator';
import { cn } from '@/lib/utils';

type DatePickerProps = {
  value?: Date;
  onChange: (d: Date | undefined) => void;
};

const MIN_YEAR = 1901;
const MAX_YEAR = 2100;
const YEAR_INTERVAL = 10;

enum MODE {
  Calendar,
  Year,
  Month,
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const t = useTranslations();
  const [open, setOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<MODE>(MODE.Calendar);
  const defaultYear = value?.getFullYear() || new Date().getFullYear();
  const defaultMonth = value?.getMonth() || new Date().getMonth();
  const defaultLeadingYear =
    Math.floor(defaultYear / YEAR_INTERVAL) * YEAR_INTERVAL + 1;
  const [leadingYear, setLeadingYear] = useState<number>(defaultLeadingYear);
  const [year, setYear] = useState<number>(defaultYear);
  const [month, setMonth] = useState<number>(defaultMonth);
  const monthDateTime = new Date(year, month);

  const handleOnYearChange = (v: number) => {
    setYear(v);
    setMode(MODE.Month);
  };

  const handleOnMonthChange = (d: Date) => {
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setMode(MODE.Calendar);
  };

  const handleOnYearPickerLeftClick = () => {
    if (leadingYear <= MIN_YEAR) return;
    setLeadingYear(leadingYear - YEAR_INTERVAL);
  };

  const handleOnYearPickerRightClick = () => {
    if (leadingYear + 9 >= MAX_YEAR) return;
    setLeadingYear(leadingYear + YEAR_INTERVAL);
  };

  const handleOnTodayClick = () => {
    const today = startOfToday();
    onChange(today);
    setOpen(false);
  };

  const handleOnDateSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  let content = (
    <>
      <div className="flex flex-row gap-3 self-stretch">
        <Button
          className="flex-1"
          variant="outline"
          size="sm"
          onClick={() => setMode(MODE.Month)}
        >
          {format(monthDateTime, 'MMM')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMode(MODE.Year)}>
          {year}
        </Button>
      </div>
      <Separator />
      <Calendar
        className="p-0"
        mode="single"
        captionLayout="dropdown"
        selected={value}
        defaultMonth={value}
        month={monthDateTime}
        onMonthChange={handleOnMonthChange}
        onSelect={handleOnDateSelect}
      />
      <Separator />
      <Button
        variant="outline"
        className="w-full"
        size="sm"
        onClick={handleOnTodayClick}
      >
        {t('today')}
      </Button>
    </>
  );

  if (mode === MODE.Year) {
    content = (
      <>
        <div className="self-stretch flex flex-row justify-between items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleOnYearPickerLeftClick}
            disabled={leadingYear <= MIN_YEAR}
            className="size-7"
          >
            <ChevronLeft />
          </Button>
          <div className="text-sm">{`${leadingYear} - ${leadingYear + YEAR_INTERVAL - 1}`}</div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleOnYearPickerRightClick}
            disabled={leadingYear + YEAR_INTERVAL - 1 >= MAX_YEAR}
            className="size-7"
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(YEAR_INTERVAL).keys()].map((i) => (
            <Button
              key={i}
              variant={leadingYear + i === year ? 'default' : 'outline'}
              onClick={() => handleOnYearChange(leadingYear + i)}
              size="sm"
            >{`${leadingYear + i}`}</Button>
          ))}
        </div>
      </>
    );
  }

  if (mode === MODE.Month) {
    content = (
      <>
        <div className="text-sm">{year}</div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(12).keys()].map((i) => (
            <Button
              key={i}
              variant={month === i ? 'default' : 'outline'}
              onClick={() => handleOnMonthChange(new Date(year, i))}
              size="sm"
            >{`${format(new Date(year, i), 'MMM')}`}</Button>
          ))}
        </div>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'flex-1 pl-3 text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          {value ? format(value, 'PPP') : <span>{t('pickADate')}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col items-center gap-3 p-3">{content}</div>
      </PopoverContent>
    </Popover>
  );
}
