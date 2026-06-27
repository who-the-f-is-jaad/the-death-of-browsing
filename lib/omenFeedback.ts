import type { OmenDistanceBand, OmenDirection } from './omenTypes';

export function getOmenFeedback(guessYear: number, answerYear: number): {
  correct: boolean;
  band?: OmenDistanceBand;
  direction?: OmenDirection;
} {
  if (guessYear === answerYear) return { correct: true };

  const distance = Math.abs(guessYear - answerYear);
  let band: OmenDistanceBand;
  if (distance <= 2) band = 'NEAR';
  else if (distance <= 5) band = 'FADING';
  else if (distance <= 10) band = 'BURIED';
  else band = 'LOST';

  return {
    correct: false,
    band,
    direction: guessYear < answerYear ? 'UNBORN' : 'TOO_LATE',
  };
}

export function getOmenFeedbackCopy(
  band: OmenDistanceBand,
  direction: OmenDirection,
): { title: string; body: string } {
  const map: Record<OmenDistanceBand, Record<OmenDirection, { title: string; body: string }>> = {
    NEAR: {
      UNBORN:   { title: 'NEAR, BUT UNBORN.',   body: 'The record had not yet been born.' },
      TOO_LATE: { title: 'NEAR, BUT TOO LATE.',  body: 'The record was already in the ground.' },
    },
    FADING: {
      UNBORN:   { title: 'FADING, BEFORE THE BIRTH.',  body: 'The signal has not yet entered the world.' },
      TOO_LATE: { title: 'FADING, AFTER THE BURIAL.',  body: 'The year has drifted past the record.' },
    },
    BURIED: {
      UNBORN:   { title: 'BURIED BEFORE THE DAWN.',  body: 'You are digging in years too old.' },
      TOO_LATE: { title: 'BURIED AFTER THE ASH.',    body: 'You are searching beyond the grave.' },
    },
    LOST: {
      UNBORN:   { title: 'LOST BEFORE THE DAWN.',    body: 'The record is not yet a shadow.' },
      TOO_LATE: { title: 'LOST AFTER THE BURIAL.',   body: 'Only later dust answers you.' },
    },
  };
  return map[band][direction];
}
