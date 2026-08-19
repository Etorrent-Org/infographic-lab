FROM python:3.12-slim

ARG VIBE_VERSION=2.21.0
RUN pip install --no-cache-dir "mistral-vibe==${VIBE_VERSION}"
RUN useradd --create-home --uid 10001 vibe

WORKDIR /runner
COPY --chown=vibe:vibe server.py ./
COPY --chown=vibe:vibe entrypoint.sh ./
COPY --chown=vibe:vibe config/ /opt/infographic-vibe-config/
RUN sed -i 's/\r$//' /runner/entrypoint.sh \
  && chmod +x /runner/entrypoint.sh \
  && mkdir -p /home/vibe/.vibe/agents /home/vibe/.vibe/prompts \
  && chown -R vibe:vibe /home/vibe/.vibe /opt/infographic-vibe-config /runner

USER vibe
ENV VIBE_HOME=/home/vibe/.vibe
ENV RUNNER_PORT=7020
EXPOSE 7020
CMD ["/runner/entrypoint.sh"]
