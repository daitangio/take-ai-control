#!/bin/bash

echo Running Headroom docker guy
echo Add to your CLI with sopmething like
echo codex mcp add headroom-jj --url http://localhost:8787
echo For stats 
echo curl http://localhost:8787/health
echo curl http://localhost:8787/stats
(cd headroom ; docker-compose up )

