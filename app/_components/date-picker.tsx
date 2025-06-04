import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SelectSingleEventHandler } from 'react-day-picker';

import { Calendar } from '@/app/_components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';

type DatePickerProps = {
  value?: Date;
  onChange: SelectSingleEventHandler;
};
export function DatePicker({ value, onChange }: DatePickerProps) {
  const t = useTranslations();
  const [displayMonth, setDisplayMonth] = useState(value || new Date());
  const currentYear = new Date().getUTCFullYear();
  const defaultYearInString = `${currentYear}`;
  const handleOnYearChange = (v: string) => {
    const newMonth = new Date(Number(v), displayMonth.getUTCMonth());
    setDisplayMonth(newMonth);
  };
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <Select
        onValueChange={handleOnYearChange}
        defaultValue={defaultYearInString}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t('year')}</SelectLabel>
            {[...Array(40).keys()].map((i) => (
              <SelectItem
                key={i}
                value={`${2000 + i}`}
              >{`${2000 + i}`}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Calendar
        mode="single"
        captionLayout="dropdown"
        selected={value}
        defaultMonth={value}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        onSelect={onChange}
        initialFocus
      />
    </div>
  );
}
