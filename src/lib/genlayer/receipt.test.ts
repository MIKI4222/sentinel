import { describe, it, expect } from 'vitest';
import { parseReceipt, findUserError, serializeReceipt } from './receipt';
import { USER_ERROR_MESSAGES } from '../../config/errors';
describe('receipt outcomes', () => {
  it.each(['ACCEPTED', 'FINALIZED'])('execution return at %s', statusName => {
    expect(parseReceipt({ statusName, txExecutionResultName: 'FINISHED_WITH_RETURN' }).kind).toBe('accepted-return');
  });
  it('accepts snake case after simplifyTransactionReceipt', () => {
    expect(parseReceipt({ status_name: 'ACCEPTED', tx_execution_result_name: 'FINISHED_WITH_RETURN' }).kind).toBe('accepted-return');
  });
  it('maps numeric fields using installed SDK', () => {
    expect(parseReceipt({ status: 7, txExecutionResult: 1, result: 1 }).kind).toBe('accepted-return');
  });
  it.each(Object.keys(USER_ERROR_MESSAGES))('finds nested UserError: %s', error => {
    const receipt = { statusName: 'ACCEPTED', txExecutionResultName: 'FINISHED_WITH_ERROR', consensus_data: { leader_receipt: [{ result: { error } }] }, count: 1n };
    expect(findUserError(receipt)).toBe(error);
    expect(parseReceipt(receipt)).toMatchObject({ kind: 'accepted-error', userError: error });
  });
  it('reports unrecognized contract error without invented output', () => {
    expect(parseReceipt({ status: 5, txExecutionResult: 2 })).toMatchObject({ kind: 'accepted-error', userError: undefined });
  });
  it.each(['UNDETERMINED', 'LEADER_TIMEOUT', 'VALIDATORS_TIMEOUT', 'CANCELED'])('terminal failure %s', statusName => {
    expect(parseReceipt({ statusName }).kind).toBe('no-consensus');
  });
  it.each(['NO_MAJORITY', 'DISAGREE', 'TIMEOUT', 'DETERMINISTIC_VIOLATION', 'MAJORITY_DISAGREE'])('failure result %s', resultName => {
    expect(parseReceipt({ resultName }).kind).toBe('no-consensus');
  });
  it.each(['PENDING', 'PROPOSING', 'COMMITTING', 'REVEALING', 'APPEAL_COMMITTING', 'APPEAL_REVEALING', 'READY_TO_FINALIZE'])('keeps intermediate %s pending despite NOT_VOTED', statusName => {
    expect(parseReceipt({ statusName, txExecutionResultName: 'NOT_VOTED' }).kind).toBe('pending');
  });
  it('NOT_VOTED without intermediate status is no-consensus', () => expect(parseReceipt({ txExecutionResultName: 'NOT_VOTED' }).kind).toBe('no-consensus'));
  it('unknown shape is not success', () => expect(parseReceipt({}).kind).toBe('unknown'));
  it('only extracts an explicitly decoded return', () => {
    expect(parseReceipt({ statusName: 'ACCEPTED', txExecutionResultName: 'FINISHED_WITH_RETURN', return_value: 'actual response' })).toMatchObject({ kind: 'accepted-return', returnValue: 'actual response' });
  });
  it('serializes bigint', () => expect(serializeReceipt({ value: 1n })).toBe('{"value":"1"}'));
});
