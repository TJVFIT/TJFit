import {logHandlers,validateBodyEntry} from '@/lib/progress/logging';
export const {GET,POST,PATCH,DELETE}=logHandlers('progress_entries','entries','entry_date',validateBodyEntry);
