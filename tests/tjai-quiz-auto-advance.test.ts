import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createQuizAutoAdvance } from '@/lib/tjai/quiz-auto-advance';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('questionnaire delayed navigation', () => {
  it.each([400, 500])('advances one time after a %s ms selection', (delay) => {
    const navigation = createQuizAutoAdvance(), advance = vi.fn();
    navigation.schedule(advance, delay);
    vi.advanceTimersByTime(delay - 1); expect(advance).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(advance).toHaveBeenCalledOnce();
    vi.runAllTimers(); expect(advance).toHaveBeenCalledOnce();
  });
  it.each(['Continue', 'Back', 'review edit', 'submit', 'unmount'])('cancels a pending selection on %s', () => {
    const navigation = createQuizAutoAdvance(), advance = vi.fn();
    navigation.schedule(advance, 400); vi.advanceTimersByTime(100);
    navigation.cancel(); vi.runAllTimers(); expect(advance).not.toHaveBeenCalled();
  });
  it('uses only the latest option when choices change rapidly', () => {
    const navigation = createQuizAutoAdvance(), first = vi.fn(), latest = vi.fn();
    navigation.schedule(first, 400); vi.advanceTimersByTime(100);
    navigation.schedule(latest, 400); vi.advanceTimersByTime(300);
    expect(first).not.toHaveBeenCalled(); expect(latest).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100); expect(latest).toHaveBeenCalledOnce();
  });
  it('does not skip a question when Continue wins the race', () => {
    const navigation = createQuizAutoAdvance(); let question = 0;
    navigation.schedule(() => { question += 1; }, 400);
    vi.advanceTimersByTime(100); navigation.cancel(); question += 1;
    vi.runAllTimers(); expect(question).toBe(1);
  });
  it('wires cancellation into both option types and manual navigation', () => {
    const source = readFileSync('src/components/tjai/tjai-quiz.tsx', 'utf8');
    expect(source).toMatch(/useEffect\(\(\) => \(\) => advanceController\.cancel\(\), \[advanceController\]\)/);
    for (const name of ['editStep', 'submitAll', 'goNext']) expect(source).toMatch(new RegExp('const '+name+' = [^\\n]+\\{\\s*advanceController\\.cancel\\(\\)'));
    expect(source).toContain('onClick={() => { advanceController.cancel(); setIdx((v) => Math.max(0, v - 1)); }}');
    expect(source.match(/advanceController\.schedule\(/g)).toHaveLength(2);
    expect(source.match(/v === safeIdx \? Math\.min\(total - 1, v \+ 1\) : v/g)).toHaveLength(2);
  });
});
