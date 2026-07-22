import { describe, it, expect } from 'vitest';
import {
  agentMessageToBodyMessage,
  bodyMessageToAgentMessage,
  mergeAgentMessagesWithBodyMessages,
} from './messageAdapters';
import type { AgentMessage } from '../types/agent';
import type { BodyMessage } from './messageAdapters';

const makeAgentMessage = (overrides: Partial<AgentMessage> = {}): AgentMessage => ({
  id: 'msg-1',
  role: 'user',
  content: 'Hello',
  thinkingSteps: [],
  toolCalls: [],
  sources: [],
  tokenUsage: null,
  model: null,
  finishReason: null,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('agentMessageToBodyMessage', () => {
  it('converts user role to USER type', () => {
    const result = agentMessageToBodyMessage(makeAgentMessage({ role: 'user' }));
    expect(result.type).toBe('USER');
  });

  it('converts assistant role to AI type', () => {
    const result = agentMessageToBodyMessage(makeAgentMessage({ role: 'assistant' }));
    expect(result.type).toBe('AI');
  });

  it('maps content to message field', () => {
    const result = agentMessageToBodyMessage(makeAgentMessage({ content: 'test' }));
    expect(result.message).toBe('test');
  });

  it('handles null content as empty string', () => {
    const result = agentMessageToBodyMessage(makeAgentMessage({ content: null }));
    expect(result.message).toBe('');
  });

  it('builds sourcesMetadata keyed by index in sources[]', () => {
    const msg = makeAgentMessage({
      sources: [
        { id: 's1', type: 'knowledge', title: 'First', url: 'http://x.com', snippet: 'snip-1' },
        { id: 's2', type: 'knowledge', title: 'Second', url: 'http://y.com', snippet: 'snip-2' },
      ],
    });
    const result = agentMessageToBodyMessage(msg);
    expect(result.sourcesMetadata).toHaveLength(2);
    expect(result.sourcesMetadata![0].source).toBe('0');
    expect(result.sourcesMetadata![0].metadata).toMatchObject({ source: '0', title: 'First' });
    expect(result.sourcesMetadata![1].source).toBe('1');
    expect(result.sourcesMetadata![1].metadata).toMatchObject({ source: '1', title: 'Second' });
  });

  it('rewrites [N] citation markers to markdown links with the index as href', () => {
    const msg = makeAgentMessage({
      role: 'assistant',
      content: 'See [1] and also [3] for context.',
      sources: [
        { id: 'a', type: 'knowledge', title: 'First', url: 'http://x.com' },
        { id: 'b', type: 'knowledge', title: 'Second', url: 'http://y.com' },
        { id: 'c', type: 'knowledge', title: 'Third', url: 'http://z.com' },
      ],
    });
    const result = agentMessageToBodyMessage(msg);
    // [1] → sources[0] (index 0); [3] → sources[2] (index 2)
    expect(result.message).toBe('See [First](0) and also [Third](2) for context.');
  });

  it('leaves [N] markers untouched when index is out of range', () => {
    const msg = makeAgentMessage({
      role: 'assistant',
      content: 'See [5].',
      sources: [{ id: 'a', type: 'knowledge', title: 'First', url: 'http://x.com' }],
    });
    const result = agentMessageToBodyMessage(msg);
    expect(result.message).toBe('See [5].');
  });
});

describe('bodyMessageToAgentMessage', () => {
  it('converts USER type to user role', () => {
    const body: BodyMessage = { id: '1', type: 'USER', message: 'Hi' };
    const result = bodyMessageToAgentMessage(body);
    expect(result.role).toBe('user');
  });

  it('defaults arrays and nulls for missing fields', () => {
    const body: BodyMessage = { id: '1', type: 'AI', message: 'Hi' };
    const result = bodyMessageToAgentMessage(body);
    expect(result.thinkingSteps).toEqual([]);
    expect(result.toolCalls).toEqual([]);
    expect(result.sources).toEqual([]);
    expect(result.tokenUsage).toBeNull();
  });
});

describe('mergeAgentMessagesWithBodyMessages', () => {
  it('merges preserving thumbSignals and user from body messages', () => {
    const agent = [makeAgentMessage({ id: 'x', content: 'updated' })];
    const body: BodyMessage[] = [
      { id: 'x', type: 'USER', message: 'old', thumbSignals: [{ up: true }], user: { id: 'u1' } },
    ];
    const result = mergeAgentMessagesWithBodyMessages(agent, body);
    expect(result[0].message).toBe('updated');
    expect(result[0].thumbSignals).toEqual([{ up: true }]);
    expect(result[0].user).toEqual({ id: 'u1' });
  });
});
