# Hook input fixtures for Claude Code 2.1.304

These two files follow the input objects that the installed Claude Code 2.1.304
bundle builds for the Stop and SubagentStop events. The field names come from that
bundle's source, read locally on 3 November 2026. They were not captured from a
live session, because a live session sends repository content to a model API and
that needs Kevin's approval.

Common fields: session_id, transcript_path, cwd, permission_mode, and for the main
agent no agent_id. Stop adds hook_event_name, stop_hook_active,
last_assistant_message, background_tasks and session_crons. SubagentStop adds
hook_event_name, stop_hook_active, agent_id, agent_type, agent_transcript_path,
last_assistant_message, background_tasks and session_crons.

All values are synthetic. Tests replace cwd with a temporary directory.

To replace these with captured payloads, add a hook that copies stdin to a file in
a disposable session, then commit the result here with the Claude Code version in
the directory name.
