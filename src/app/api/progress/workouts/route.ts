import {logHandlers,validateWorkout} from '@/lib/progress/logging';
export const {GET,POST,PATCH,DELETE}=logHandlers('workout_logs','workouts','workout_date',validateWorkout);
