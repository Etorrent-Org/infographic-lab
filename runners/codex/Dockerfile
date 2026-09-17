FROM node:22-bookworm-slim

ARG CODEX_VERSION=latest
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 ca-certificates git \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g "@openai/codex@${CODEX_VERSION}"

WORKDIR /runner
COPY server.py /runner/server.py
RUN mkdir -p /work /home/node/.codex \
    && chown -R node:node /work /home/node/.codex /runner

USER node
ENV CODEX_HOME=/home/node/.codex
ENV CODEX_WORK_DIR=/work
ENV RUNNER_PORT=7030
EXPOSE 7030
CMD ["python3", "/runner/server.py"]
