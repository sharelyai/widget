# @sharelyai/widget-services

## 0.0.2

### Patch Changes

- Recover the agent answer when the SSE stream ends without a "done" event.

  A dropped stream tail used to commit an empty message as if it had
  succeeded, rendering a blank "Completed N steps" chip with no error and no
  retry. The client now re-fetches the thread and renders the persisted
  answer, and only reports an error -- with a working retry -- when the
  answer genuinely is not there.
