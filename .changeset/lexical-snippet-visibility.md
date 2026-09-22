---
"@sharelyai/widget-ui-search": patch
"@sharelyai/widget-services": patch
"@sharelyai/widget-ui-shared": patch
"@sharelyai/widget-ui-agent-chat": patch
"@sharelyai/widget-ui-chat": patch
"@sharelyai/widget-ui-browse": patch
---

Show the highlighted snippet of lexical search hits even when the workspace styling sets `listItem.showDescription: false`; that flag now only hides the description fallback. `snippetToSegments` also decodes numeric HTML entities (`&#038;`, `&#x2014;`) found in crawled content. Other packages are bumped only to keep the linked set on one version.
