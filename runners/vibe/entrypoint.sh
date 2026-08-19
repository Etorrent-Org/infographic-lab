#!/bin/sh
set -eu

mkdir -p "$VIBE_HOME/agents" "$VIBE_HOME/prompts"
cp /opt/infographic-vibe-config/agents/infographic-json.toml "$VIBE_HOME/agents/infographic-json.toml"
cp /opt/infographic-vibe-config/prompts/infographic-json.md "$VIBE_HOME/prompts/infographic-json.md"

exec python /runner/server.py
