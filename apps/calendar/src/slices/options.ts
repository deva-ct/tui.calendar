import produce from 'immer';

import { DEFAULT_DAY_NAMES } from '@src/helpers/dayName';
import { Day } from '@src/time/datetime';
import { mergeObject } from '@src/utils/object';
import { isBoolean } from '@src/utils/type';

import type { EventObject } from '@t/events';
import type { GridSelectionOptions, Options, TimezoneOptions } from '@t/options';
import type {
  CalendarMonthOptions,
  CalendarState,
  CalendarStore,
  CalendarWeekOptions,
  SetState,
} from '@t/store';

function initializeWeekOptions(weekOptions: Options['week'] = {}): CalendarWeekOptions {
  return {
    startDayOfWeek: Day.SUN,
    dayNames: [],
    narrowWeekend: false,
    workweek: false,
    showNowIndicator: true,
    showTimezoneCollapseButton: false,
    timezonesCollapsed: false,
    hourStart: 0,
    hourEnd: 24,
    eventView: true,
    taskView: true,
    ...weekOptions,
  };
}

function initializeTimezoneOptions(timezoneOptions: Options['timezone'] = {}): TimezoneOptions {
  return {
    zones: [],
    ...timezoneOptions,
  };
}

function initializeMonthOptions(monthOptions: Options['month'] = {}): CalendarMonthOptions {
  const month: CalendarMonthOptions = {
    dayNames: [],
    visibleWeeksCount: 0,
    workweek: false,
    narrowWeekend: false,
    startDayOfWeek: Day.SUN,
    isAlways6Weeks: true,
    visibleEventCount: 6,
    ...monthOptions,
  };

  if (month.dayNames.length === 0) {
    month.dayNames = DEFAULT_DAY_NAMES.slice() as Exclude<CalendarMonthOptions['dayNames'], []>;
  }

  return month;
}

export function initializeGridSelectionOptions(
  options: Options['gridSelection']
): GridSelectionOptions {
  if (isBoolean(options)) {
    return {
      enableDblClick: options,
      enableClick: options,
    };
  }

  return {
    enableDblClick: true,
    enableClick: true,
    ...options,
  };
}

const initialEventFilter = (event: EventObject) => !!event.isVisible;

// TODO: some of options has default values. so it should be `Required` type.
// But it needs a complex type such as `DeepRequired`.
// maybe leveraging library like `ts-essential` might be helpful.
export type OptionsSlice = {
  options: Omit<Required<Options>, 'template' | 'calendars' | 'theme'> & {
    gridSelection: GridSelectionOptions;
  };
};

export type OptionsDispatchers = {
  setOptions: (newOptions: Partial<OptionsSlice['options']>) => void;
};

// eslint-disable-next-line complexity
export function createOptionsSlice(options: Options = {}): OptionsSlice {
  return {
    options: {
      defaultView: options.defaultView ?? 'week',
      useFormPopup: options.useFormPopup ?? false,
      useDetailPopup: options.useDetailPopup ?? false,
      isReadOnly: options.isReadOnly ?? false,
      week: initializeWeekOptions(options.week),
      month: initializeMonthOptions(options.month),
      gridSelection: initializeGridSelectionOptions(options.gridSelection),
      usageStatistics: options.usageStatistics ?? true,
      eventFilter: options.eventFilter ?? initialEventFilter,
      timezone: initializeTimezoneOptions(options.timezone),
    },
  };
}

export function createOptionsDispatchers(set: SetState<CalendarStore>): OptionsDispatchers {
  return {
    setOptions: (newOptions: Partial<OptionsSlice['options']> = {}) =>
      set(
        produce((state: CalendarState) => {
          mergeObject(state.options, newOptions);
        })
      ),
  };
}
