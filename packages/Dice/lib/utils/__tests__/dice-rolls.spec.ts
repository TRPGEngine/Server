import { processRoll } from '../dice-roll';

describe('dice roll', () => {
  test('processRoll', () => {
    processRoll('.r1d100+10');
  });
});
