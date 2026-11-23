import { angleDelta, depthPhase } from './Ouroboros';
import { restoreOrder } from './gridModel';
test('depth wraps in both directions without losing fractional position', () => {
  expect(depthPhase(120.25)).toBeCloseTo(0.25);
  expect(depthPhase(-120.25)).toBeCloseTo(0.75);
  expect(depthPhase(1)).toBe(0);
});
test('rotation crosses the angle seam continuously in both directions', () => {
  expect(angleDelta(-Math.PI + 0.1, Math.PI - 0.1)).toBeCloseTo(0.2);
  expect(angleDelta(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(-0.2);
});
test('last placeholder migrates in place with all older widget aliases', () => {
  expect(restoreOrder(['delivery', 'testing', 'data', 'logic', 'interface', 'clock'])).toEqual([
    'ouroboros',
    'speculum',
    'opus',
    'codex',
    'oculus',
    'clock',
  ]);
});
